#!/usr/bin/env python
"""
helper for bigquery tasks
"""
import time
import pandas as pd
from loguru import logger
from typing import Any, Dict, List, Mapping, Optional, Sequence, Union

from google.cloud import bigquery
from google.cloud.bigquery import Client, Dataset
from google.cloud.bigquery.dataset import DatasetReference as DatasetReference
from google.cloud.bigquery.schema import SchemaField
from google.cloud.bigquery.job import QueryJob, QueryJobConfig
from google.cloud.bigquery.table import Table, RowIterator


class BigQueryHelper:
    """
    Helper class to simplify common BigQuery tasks like executing queries,
    showing table schemas, etc without worrying about table or dataset pointers.
    See the BigQuery docs for details of the steps this class lets you skip:
    https://googlecloudplatform.github.io/google-cloud-python/latest/bigquery/reference.html
    """

    def __init__(
        self,
        active_project: str,
        dataset_name: str,
        client: Client,
        max_wait_seconds: int = 180,
    ):
        self.project_name: str = active_project
        self.dataset_name: str = dataset_name
        self.max_wait_seconds: int = max_wait_seconds
        self.client: Client = client
        self.__dataset_ref: DatasetReference = self.client.dataset(
            self.dataset_name, project=self.project_name
        )
        self.dataset: Optional[Dataset] = None
        self.tables: Dict[str, Table] = dict()
        # {table name (str): table object}
        self.__table_refs: Dict[str, bigquery.table.TableReference] = dict()
        # {table name (str): table reference}
        self.total_gb_used_net_cache: int = 0
        self.bytes_per_gb: int = 2 ** 30

    def __fetch_dataset(self) -> None:
        """
        Lazy loading of dataset. For example,
        if the user only calls `self.query_to_pandas` then the
        dataset never has to be fetched.
        """
        if self.dataset is None:
            self.dataset = self.client.get_dataset(self.__dataset_ref)

    def __fetch_table(self, table_name: str) -> None:
        """
        Lazy loading of table
        """
        self.__fetch_dataset()
        if table_name not in self.__table_refs:
            # Done to appease mypy, but should be resolved by __fetch_dataset.
            assert self.dataset is not None
            self.__table_refs[table_name] = self.dataset.table(table_name)
        if table_name not in self.tables:
            self.tables[table_name] = self.client.get_table(
                self.__table_refs[table_name]
            )

    def __handle_record_field(
        self,
        row: Dict[str, Any],
        schema_details: List[List[Dict[str, Any]]],
        top_level_name: str = "",
    ) -> None:
        """
        Unpack a single row, including any nested fields.
        """
        name = row["name"]
        if top_level_name != "":
            name = top_level_name + "." + name
        schema_details.append(
            [
                {
                    "name": name,
                    "type": row["type"],
                    "mode": row["mode"],
                    "fields": pd.np.nan,
                    "description": row["description"],
                }
            ]
        )
        # float check is to dodge row['fields'] == np.nan
        if isinstance(row.get("fields", 0.0), float):
            return None
        for entry in row["fields"]:
            self.__handle_record_field(entry, schema_details, name)
        return None

    def __unpack_all_schema_fields(self, schema: pd.DataFrame) -> pd.DataFrame:
        """
        Unrolls nested schemas. Returns dataframe with one row per field,
        and the field names in the format accepted by the API.
        Results will look similar to the website schema, such as:
            https://bigquery.cloud.google.com/table/bigquery-public-data:github_repos.commits?pli=1
        # TODO: update URL
        Args:
            schema: DataFrame derived from api repr of raw table.schema
        Returns:
            Dataframe of the unrolled schema.
        """
        schema_details: List[List[Dict[str, Any]]] = []
        schema.apply(
            lambda row: self.__handle_record_field(row, schema_details), axis=1
        )
        result: pd.DataFrame = pd.concat(
            [pd.DataFrame.from_dict(x) for x in schema_details]
        )
        result.reset_index(drop=True, inplace=True)
        del result["fields"]
        return result

    def table_schema(self, table_name: str) -> pd.DataFrame:
        """
        Get the schema for a specific table from a dataset.
        Unrolls nested field names into the format that can be copied
        directly into queries. For example, for the `github.commits` table,
        the this will return `committer.name`.
        This is a very different return signature than BigQuery's table.schema.
        """
        self.__fetch_table(table_name)
        raw_schema: Sequence[SchemaField] = self.tables[table_name].schema
        schema: pd.DataFrame = pd.DataFrame.from_dict(
            [x.to_api_repr() for x in raw_schema]
        )
        # the api_repr only has the fields column for tables with nested data
        if "fields" in schema.columns:
            schema = self.__unpack_all_schema_fields(schema)
        # Set the column order
        schema = schema[["name", "type", "mode", "description"]]
        return schema

    def list_tables(self) -> List[str]:
        """
        List the names of the tables in a dataset
        """
        self.__fetch_dataset()
        return [x.table_id for x in self.client.list_tables(self.dataset)]

    def estimate_query_size(self, query: str) -> float:
        """
        Estimate gigabytes scanned by query.
        Does not consider if there is a cached query table.
        See https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs#configuration.dryRun
        """
        my_job_config: QueryJobConfig = QueryJobConfig()
        my_job_config.dry_run = True
        my_job: QueryJob = self.client.query(query, job_config=my_job_config)
        return my_job.total_bytes_processed / self.bytes_per_gb

    def query_to_pandas(self, query: str) -> Optional[pd.DataFrame]:
        """
        Execute a SQL query & return a pandas dataframe
        """
        my_job: QueryJob = self.client.query(query)
        start_time: float = time.time()
        while not my_job.done():
            if (time.time() - start_time) > self.max_wait_seconds:
                logger.info("Max wait time elapsed, query cancelled.")
                self.client.cancel_job(my_job.job_id)
                return None
            time.sleep(0.1)
        # Queries that hit errors will return an exception type.
        # Those exceptions don't get raised until we call my_job.to_dataframe()
        # In that case, my_job.total_bytes_billed can be called but is None
        if my_job.total_bytes_billed:
            self.total_gb_used_net_cache += (
                my_job.total_bytes_billed / self.bytes_per_gb
            )
        return my_job.to_dataframe()

    def query_to_pandas_safe(
        self, query: str, max_gb_scanned: int = 1
    ) -> Optional[pd.DataFrame]:
        """
        Execute a query, but only if the query would scan less than `max_gb_scanned` of data.
        """
        query_size: float = self.estimate_query_size(query)
        if query_size <= max_gb_scanned:
            return self.query_to_pandas(query)
        msg = f"Query cancelled; estimated size of {query_size} exceeds limit of {max_gb_scanned} GB"
        logger.info(msg)
        return None

    def head(
        self,
        table_name: str,
        num_rows: int = 5,
        start_index: Optional[int] = None,
        selected_columns: Optional[Sequence[str]] = None,
    ) -> pd.DataFrame:
        """
        Get the first n rows of a table as a DataFrame.
        Does not perform a full table scan; should use a trivial amount
        of data as long as n is small.
        """
        self.__fetch_table(table_name)
        active_table: Table = self.tables[table_name]
        schema_subset: Optional[List[str]] = None
        if selected_columns:
            schema_subset = [
                col for col in active_table.schema if col.name in selected_columns
            ]
        results: RowIterator = self.client.list_rows(
            active_table,
            selected_fields=schema_subset,
            max_results=num_rows,
            start_index=start_index,
        )
        return pd.DataFrame(
            data=[list(x.values()) for x in results], columns=list(results[0].keys())
        )

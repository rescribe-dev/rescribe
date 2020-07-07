import React, { useState } from 'react';
import { Container } from 'reactstrap';

import './index.scss';
import {
  File,
  FileQuery,
  FileQueryVariables,
  FileTextQuery,
  FileTextQueryVariables,
  FileText,
} from 'lib/generated/datamodel';
import { QueryResult } from '@apollo/react-common';
import { isSSR } from 'utils/checkSSR';
import { useQuery } from '@apollo/react-hooks';
import { toast } from 'react-toastify';
import { ObjectId } from 'mongodb';
import { client } from 'utils/apollo';
import { ApolloQueryResult } from 'apollo-client';

interface FilesProps {
  repositoryID: ObjectId;
  branch: string;
  name: string;
  path: string;
}

const FileData = (args: FilesProps): JSX.Element => {
  const [fileTextData, setFileTextData] = useState<
    ApolloQueryResult<FileTextQuery> | undefined
  >(undefined);
  const fileRes: QueryResult<FileQuery, FileQueryVariables> | undefined = isSSR
    ? undefined
    : useQuery<FileQuery, FileQueryVariables>(File, {
        variables: {
          branch: args.branch,
          name: args.name,
          path: args.path,
          repositoryID: args.repositoryID,
        },
        fetchPolicy: 'no-cache',
        onError: (err) => {
          toast(err.message, {
            type: 'error',
          });
        },
        onCompleted: async (data) => {
          setFileTextData(
            await client.query<FileTextQuery, FileTextQueryVariables>({
              query: FileText,
              variables: {
                branch: args.branch,
                id: data.file._id,
              },
              fetchPolicy: 'no-cache',
            })
          );
        },
      });
  return (
    <Container>
      {!fileRes ||
      fileRes.loading ||
      !fileRes.data ||
      !fileTextData ||
      fileTextData.loading ||
      !fileTextData.data ? (
        <p>loading...</p>
      ) : (
        <>
          <p>{fileRes.data.file.name}</p>
          <p>file text:</p>
          {fileTextData.data.fileText.map((line, i) => (
            <p key={`line-${i}-${fileRes.data?.file.name}`}>{line}</p>
          ))}
        </>
      )}
    </Container>
  );
};

export default FileData;

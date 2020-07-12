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

import CodeHighlight from 'components/codeHighlight';
import { Language } from 'prism-react-renderer';

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
      !fileTextData.data ||
      !fileRes.data.file.language ? (
        <p>loading...</p>
      ) : (
        <>
          <p>{fileRes.data.file.name}</p>
          <p>File text:</p>
          <CodeHighlight
            startIndex={0}
            code={fileTextData.data.fileText}
            language={fileRes.data.file.language as Language}
          />
        </>
      )}
    </Container>
  );
};

export default FileData;

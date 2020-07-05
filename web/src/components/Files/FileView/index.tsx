import React from 'react';
import { Container } from 'reactstrap';

import './index.scss';
import { File, FileQuery, FileQueryVariables } from 'lib/generated/datamodel';
import { QueryResult } from '@apollo/react-common';
import { isSSR } from 'utils/checkSSR';
import { useQuery } from '@apollo/react-hooks';
import { toast } from 'react-toastify';
import { ObjectId } from 'mongodb';

interface FilesProps {
  repositoryID: ObjectId;
  branch: string;
  name: string;
  path: string;
}

const FileData = (args: FilesProps): JSX.Element => {
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
      });
  return (
    <Container>
      {!fileRes || fileRes.loading || !fileRes.data ? (
        <p>loading...</p>
      ) : (
        <p>{fileRes.data.file.name}</p>
      )}
    </Container>
  );
};

export default FileData;

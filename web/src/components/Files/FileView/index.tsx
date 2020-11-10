import React, { useState } from 'react';
import { Button, Container } from 'reactstrap';

import './index.scss';
import {
  File,
  FileQuery,
  FileQueryVariables,
  FileTextQuery,
  FileTextQueryVariables,
  FileText,
} from 'lib/generated/datamodel';
import { isSSR } from 'utils/checkSSR';
import { useQuery, QueryResult } from '@apollo/react-hooks';
import { toast } from 'react-toastify';
import ObjectId from 'bson-objectid';
import { client } from 'utils/apollo';
import { ApolloQueryResult } from 'apollo-client';

import CodeHighlight from 'components/codeHighlight';
import { Language } from 'prism-react-renderer';
import { AiFillEdit } from 'react-icons/ai';
import EditFile from './EditFile';

interface FilesProps {
  repositoryID: ObjectId;
  branch: string;
  name: string;
  path: string;
}

enum ViewState {
  view = 'view',
  edit = 'edit',
}

const FileView = (args: FilesProps): JSX.Element => {
  const [fileTextData, setFileTextData] = useState<
    ApolloQueryResult<FileTextQuery> | undefined
  >(undefined);

  const [fileMode, setFileMode] = useState<ViewState>(ViewState.view);

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
          {fileMode === ViewState.view ? (
            <>
              <Button
                onClick={(evt) => {
                  evt.preventDefault();
                  setFileMode(ViewState.edit);
                }}
              >
                <AiFillEdit />
              </Button>
              <p>File text:</p>
              <CodeHighlight
                startIndex={0}
                code={fileTextData.data.fileText}
                language={(fileRes.data.file.language as unknown) as Language}
              />
            </>
          ) : fileMode === ViewState.edit ? (
            <EditFile
              fileText={fileTextData.data.fileText}
              onExit={(newText) => {
                setFileTextData({
                  ...fileTextData,
                  data: {
                    fileText: newText.split('\n')
                  }
                });
                setFileMode(ViewState.view);
              }}
            />
          ) : (
            <p>invalid file mode provided</p>
          )}
        </>
      )}
    </Container>
  );
};

export default FileView;

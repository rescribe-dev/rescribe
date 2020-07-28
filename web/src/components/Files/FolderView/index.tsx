import React, { useEffect, useState } from 'react';
import { Container, Table, Row, Col, Button } from 'reactstrap';

import './index.scss';

import { toast } from 'react-toastify';
import {
  Files,
  FilesQuery,
  FilesQueryVariables,
  FoldersQuery,
  FoldersQueryVariables,
  Folders,
  DelFile,
  DelFileMutation,
  DelFileMutationVariables,
} from 'lib/generated/datamodel';
import { AiFillFolder, AiOutlineFile } from 'react-icons/ai';
import { ObjectId } from 'mongodb';
import { Link } from 'gatsby';
import { useMutation } from '@apollo/react-hooks';
import { client } from 'utils/apollo';
import { ApolloQueryResult } from 'apollo-client';

interface FolderProps {
  branch: string;
  repositoryID: ObjectId;
  path: string;
  name: string;
  repositoryName: string;
  repositoryOwner: string;
}

const perPage = 10;

const FilesList = (args: FolderProps): JSX.Element => {
  const [folders, setFolders] = useState<
    ApolloQueryResult<FoldersQuery> | undefined
  >(undefined);
  const [files, setFiles] = useState<ApolloQueryResult<FilesQuery> | undefined>(
    undefined
  );
  const [fullPath, setFullPath] = useState<string | undefined>(undefined);
  useEffect(() => {
    let path = args.path + args.name;
    if (path.length === 0 || path[path.length - 1] !== '/') {
      path += '/';
    }
    setFullPath(path);
    async () => {
      try {
        setFolders(
          await client.query<FoldersQuery, FoldersQueryVariables>({
            query: Folders,
            variables: {
              repositories: [args.repositoryID],
              page: 0,
              perpage: perPage,
              branches: [args.branch],
              path,
            },
            fetchPolicy: 'network-only',
          })
        );
        setFiles(
          await client.query<FilesQuery, FilesQueryVariables>({
            query: Files,
            variables: {
              repositories: [args.repositoryID],
              page: 0,
              perpage: perPage,
              branches: [args.branch],
              path,
            },
            fetchPolicy: 'network-only',
          })
        );
      } catch (err) {
        const errObj = err as Error;
        toast(errObj.message, {
          type: 'error',
        });
      }
    };
  }, []);

  const [deleteFileMutation] = useMutation<
    DelFileMutation,
    DelFileMutationVariables
  >(DelFile);

  return (
    <Container>
      {!folders ||
      folders.loading ||
      !folders.data ||
      !files ||
      files.loading ||
      !files.data ? (
        <p>loading...</p>
      ) : (
        <>
          {folders.data.folders.length === 0 &&
          files.data.files.length === 0 ? (
            <p>no files in repository {args.repositoryName}</p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Files:</th>
                </tr>
              </thead>
              <tbody>
                {folders.data.folders.map((folder) => (
                  <tr key={folder._id}>
                    <td>
                      <Row>
                        <Col>
                          <AiFillFolder />
                        </Col>
                        <Col>
                          <Link
                            to={
                              `/${args.repositoryOwner}/${args.repositoryName}` +
                              `/tree/${args.branch}${fullPath}${folder.name}`
                            }
                          >
                            {folder.name}
                          </Link>
                        </Col>
                        <Col>
                          <Button
                            style={{
                              backgroundColor: '#fff',
                              color: '#ff0000',
                              border: '0px',
                            }}
                          >
                            Remove Folder
                          </Button>
                        </Col>
                      </Row>
                    </td>
                  </tr>
                ))}
                {files.data.files.map((file) => (
                  <tr key={file._id}>
                    <td>
                      <Row>
                        <Col>
                          <AiOutlineFile />
                        </Col>
                        <Col>
                          <Link
                            to={
                              `/${args.repositoryOwner}/${args.repositoryName}` +
                              `/tree/${args.branch}${fullPath}${file.name}`
                            }
                          >
                            {file.name}
                          </Link>
                        </Col>
                        <Col>
                          <Button
                            style={{
                              backgroundColor: '#fff',
                              color: '#ff0000',
                              border: '0px',
                            }}
                            onClick={() => {
                              deleteFileMutation({
                                variables: {
                                  id: file._id,
                                  branch: args.branch,
                                },
                                fetchPolicy: 'cache-and-network',
                                update: () => {
                                  // if (files !== undefined && files.data !== undefined) {
                                  //   newFiles = filesRes.data.files.filter(
                                  //     (file: { _id: any }) => file._id !== id
                                  //   );
                                  // } else {
                                  //   newFiles = 'hello';
                                  // }
                                  // alert(newFiles);
                                  // cache.writeQuery({
                                  //   query: Files,
                                  //   data: { files: newFiles },
                                  // });
                                },
                              });
                            }}
                          >
                            Remove File
                          </Button>
                        </Col>
                      </Row>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      )}
    </Container>
  );
};

export default FilesList;

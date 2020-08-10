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
  DelFolderMutation,
  DelFolderMutationVariables,
  DelFolder,
} from 'lib/generated/datamodel';
import { AiFillFolder, AiOutlineFile } from 'react-icons/ai';
import { ObjectId } from 'mongodb';
import { Link } from 'gatsby';
import { useMutation } from '@apollo/react-hooks';
import { client } from 'utils/apollo';

interface FolderProps {
  branch: string;
  repositoryID: ObjectId;
  path: string;
  name: string;
  repositoryName: string;
  repositoryOwner: string;
}

type FileObj = {
  loading: boolean;
  data: any[] | undefined;
};

type FolderObj = {
  loading: boolean;
  data: any[] | undefined;
};

const perPage = 10;

const FilesList = (args: FolderProps): JSX.Element => {
  // const [folders, setFolders] = useState<
  //   ApolloQueryResult<FoldersQuery> | undefined
  // >(undefined);
  const [folders, setFolders] = useState<FolderObj>({
    loading: true,
    data: undefined,
  });
  // const [files, setFiles] = useState<ApolloQueryResult<FilesQuery> | undefined>(
  //   undefined
  // );
  const [files, setFiles] = useState<FileObj>({
    loading: true,
    data: undefined,
  });

  const [fullPath, setFullPath] = useState<string | undefined>(undefined);
  useEffect(() => {
    let path = args.path + args.name;
    if (path.length === 0 || path[path.length - 1] !== '/') {
      path += '/';
    }
    setFullPath(path);
    (async () => {
      try {
        // setFolders(
        //   await client.query<FoldersQuery, FoldersQueryVariables>({
        //     query: Folders,
        //     variables: {
        //       repositories: [args.repositoryID],
        //       page: 0,
        //       perpage: perPage,
        //       branches: [args.branch],
        //       path,
        //     },
        //     fetchPolicy: 'network-only',
        //   })
        // );

        const folderRes = await client.query<
          FoldersQuery,
          FoldersQueryVariables
        >({
          query: Folders,
          variables: {
            repositories: [args.repositoryID],
            page: 0,
            perpage: perPage,
            branches: [args.branch],
            path,
          },
          fetchPolicy: 'network-only',
        });
        setFolders({
          loading: folderRes.loading,
          data: folderRes.data.folders,
        });

        // setFiles(
        //   await client.query<FilesQuery, FilesQueryVariables>({
        //     query: Files,
        //     variables: {
        //       repositories: [args.repositoryID],
        //       page: 0,
        //       perpage: perPage,
        //       branches: [args.branch],
        //       path,
        //     },
        //     fetchPolicy: 'network-only',
        //   })
        // );

        const fileRes = await client.query<FilesQuery, FilesQueryVariables>({
          query: Files,
          variables: {
            repositories: [args.repositoryID],
            page: 0,
            perpage: perPage,
            branches: [args.branch],
            path,
          },
          fetchPolicy: 'network-only',
        });
        setFiles({
          loading: fileRes.loading,
          data: fileRes.data.files,
        });
      } catch (err) {
        const errObj = err as Error;
        toast(errObj.message, {
          type: 'error',
        });
      }
    })();
  }, []);

  const [deleteFileMutation] = useMutation<
    DelFileMutation,
    DelFileMutationVariables
  >(DelFile);
  const [deleteFolderMutation] = useMutation<
    DelFolderMutation,
    DelFolderMutationVariables
  >(DelFolder);
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
          {folders.data.length === 0 && files.data.length === 0 ? (
            <p>no files in current directory</p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Files:</th>
                </tr>
              </thead>
              <tbody>
                {folders.data.map((folder) => (
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
                              color: '#D9534F',
                              border: '0px',
                            }}
                            onClick={() => {
                              deleteFolderMutation({
                                variables: {
                                  id: folder._id,
                                  branch: args.branch,
                                },
                                update: () => {
                                  setFolders({
                                    data: folders.data?.filter(
                                      (f) => f._id !== folder._id
                                    ),
                                    loading: false,
                                  });
                                },
                              });
                            }}
                          >
                            Remove Folder
                          </Button>
                        </Col>
                      </Row>
                    </td>
                  </tr>
                ))}
                {files.data.map((file) => (
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
                              color: '#D9534F',
                              border: '0px',
                            }}
                            onClick={() => {
                              deleteFileMutation({
                                variables: {
                                  id: file._id,
                                  branch: args.branch,
                                },
                                update: () => {
                                  setFiles({
                                    data: files.data?.filter(
                                      (f) => f._id !== file._id
                                    ),
                                    loading: false,
                                  });
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

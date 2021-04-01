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
import { AiFillFolder, AiOutlineFile, AiFillDelete } from 'react-icons/ai';
import ObjectId from 'bson-objectid';
import { Link } from 'gatsby';
import { useMutation, ApolloQueryResult } from '@apollo/react-hooks';
import { client } from 'utils/apollo';
import DeleteFolderModal from './DeleteFolderModal';
import DeleteFileModal from './DeleteFileModal';

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
  const [currentFolder, setCurrentFolder] = useState<ObjectId | undefined>(
    undefined
  );
  const [folders, setFolders] = useState<
    ApolloQueryResult<FoldersQuery> | undefined
  >(undefined);

  const [currentFile, setCurrentFile] = useState<ObjectId | undefined>(
    undefined
  );
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
    (async () => {
      try {
        const foldersRes = await client.query<
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
        foldersRes.data = {
          ...foldersRes.data,
          folders: foldersRes.data.folders.map((folder) => ({
            ...folder,
            _id: new ObjectId(folder._id),
          })),
        };
        setFolders(foldersRes);

        const filesRes = await client.query<FilesQuery, FilesQueryVariables>({
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
        filesRes.data = {
          ...filesRes.data,
          files: filesRes.data.files.map((file) => ({
            ...file,
            _id: new ObjectId(file._id),
          })),
        };
        setFiles(filesRes);
      } catch (err) {
        const errObj = err as Error;
        toast(errObj.message, {
          type: 'error',
        });
      }
    })();
  }, []);

  const [deleteFolderModalIsOpen, setDeleteFolderModalIsOpen] = useState(false);
  const deleteFolderModalToggle = () =>
    setDeleteFolderModalIsOpen(!deleteFolderModalIsOpen);

  const [deleteFileModalIsOpen, setDeleteFileModalIsOpen] = useState(false);
  const deleteFileModalToggle = () =>
    setDeleteFileModalIsOpen(!deleteFileModalIsOpen);

  const [deleteFileMutation] = useMutation<
    DelFileMutation,
    DelFileMutationVariables
  >(DelFile);
  const [deleteFolderMutation] = useMutation<
    DelFolderMutation,
    DelFolderMutationVariables
  >(DelFolder);
  return (
    <>
      {!folders ||
      folders.loading ||
      !folders.data ||
      !files ||
      files.loading ||
      !files.data ? (
        <p>loading...</p>
      ) : (
        <>
          <Container>
            {folders.data.folders.length === 0 &&
            files.data.files.length === 0 ? (
              <p>no files in current directory</p>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <th>Files:</th>
                  </tr>
                </thead>
                <tbody>
                  {folders.data.folders.map((folder) => (
                    <tr
                      key={`folder-${(folder._id as ObjectId).toHexString()}`}
                    >
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
                                color: '#818A91',
                                backgroundColor: '#fff',
                                border: '0px',
                              }}
                              onClick={(evt) => {
                                evt.preventDefault();
                                setCurrentFolder(folder._id);
                                deleteFolderModalToggle();
                              }}
                            >
                              <AiFillDelete />
                            </Button>
                          </Col>
                        </Row>
                      </td>
                    </tr>
                  ))}
                  {files.data.files.map((file) => (
                    <tr key={`file-${(file._id as ObjectId).toHexString()}`}>
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
                                color: '#818A91',
                                backgroundColor: '#fff',
                                border: '0px',
                              }}
                              onClick={(evt) => {
                                evt.preventDefault();
                                setCurrentFile(file._id);
                                deleteFileModalToggle();
                              }}
                            >
                              <AiFillDelete />
                            </Button>
                          </Col>
                        </Row>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Container>
          <DeleteFolderModal
            isOpen={deleteFolderModalIsOpen}
            toggle={deleteFolderModalToggle}
            deleteFolder={async (): Promise<void> => {
              if (!currentFolder) return;
              await deleteFolderMutation({
                variables: {
                  id: currentFolder,
                  branch: args.branch,
                },
                update: () => {
                  setFolders({
                    ...folders,
                    loading: false,
                    data: {
                      folders: folders.data!.folders.filter(
                        (elem) => !(elem._id as ObjectId).equals(currentFolder)
                      ),
                    },
                  });
                },
              });
            }}
          />
          <DeleteFileModal
            isOpen={deleteFileModalIsOpen}
            toggle={deleteFileModalToggle}
            deleteFile={async (): Promise<void> => {
              if (!currentFile) return;
              await deleteFileMutation({
                variables: {
                  id: currentFile,
                  branch: args.branch,
                },
                update: () => {
                  setFiles({
                    ...files,
                    loading: false,
                    data: {
                      files: files.data!.files.filter(
                        (elem) => !(elem._id as ObjectId).equals(currentFile)
                      ),
                    },
                  });
                },
              });
            }}
          />
        </>
      )}
    </>
  );
};

export default FilesList;

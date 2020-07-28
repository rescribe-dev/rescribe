import React from 'react';
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
} from 'lib/generated/datamodel';
import { QueryResult } from '@apollo/react-common';
import { AiFillFolder, AiOutlineFile } from 'react-icons/ai';
import { ObjectId } from 'mongodb';
import { Link } from 'gatsby';
import { isSSR } from 'utils/checkSSR';
import { useQuery, useMutation } from '@apollo/react-hooks';

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
  let fullPath = args.path + args.name;
  if (fullPath.length === 0 || fullPath[fullPath.length - 1] !== '/') {
    fullPath += '/';
  }
  const foldersRes:
    | QueryResult<FoldersQuery, FoldersQueryVariables>
    | undefined = isSSR
    ? undefined
    : useQuery<FoldersQuery, FoldersQueryVariables>(Folders, {
        variables: {
          repositories: [args.repositoryID],
          page: 0,
          perpage: perPage,
          branches: [args.branch],
          path: fullPath,
        },
        fetchPolicy: 'no-cache',
        onError: (err) => {
          toast(err.message, {
            type: 'error',
          });
        },
      });
  const filesRes:
    | QueryResult<FilesQuery, FilesQueryVariables>
    | undefined = isSSR
    ? undefined
    : useQuery<FilesQuery, FilesQueryVariables>(Files, {
        variables: {
          repositories: [args.repositoryID],
          page: 0,
          perpage: perPage,
          branches: [args.branch],
          path: fullPath,
        },
        // fetchPolicy: 'no-cache',
      });

  const [deleteFileMutation] = useMutation(DelFile);

  const removeFile = (id: any, branch: string) => {
    // e.preventDefault();
    // e.stopPropagation();

    deleteFileMutation({
      variables: { id: id, branch: branch },

      // optimisticResponse: true,

      // refetchQueries: ['FilesQuery'], // TODO Find correct query
      refetchQueries: [
        {
          query: Files,
        },
      ],

      // update: (cache) => {
      //   // const existingFiles = cache.readQuery({ query: Files });
      //   let newFiles: any;
      //   if (filesRes !== undefined && filesRes.data !== undefined) {
      //     newFiles = filesRes.data.files.filter(
      //       (file: { _id: any }) => file._id !== id
      //     );
      //   } else {
      //     newFiles = 'hello';
      //   }

      //   alert(newFiles);

      //   cache.writeQuery({
      //     query: Files,
      //     data: { files: newFiles },
      //   });
      // },
    });
  };

  return (
    <Container>
      {!foldersRes ||
      foldersRes.loading ||
      !foldersRes.data ||
      !filesRes ||
      filesRes.loading ||
      !filesRes.data ? (
        <p>loading...</p>
      ) : (
        <>
          {foldersRes.data.folders.length === 0 &&
          filesRes.data.files.length === 0 ? (
            <p>no files in repository {args.repositoryName}</p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Files:</th>
                </tr>
              </thead>
              <tbody>
                {foldersRes.data.folders.map((folder) => (
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
                {filesRes.data.files.map((file) => (
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
                            onClick={async () => {
                              removeFile(file._id, args.branch);
                              // try {
                              //   await client.mutate<
                              //     DelFileMutation,
                              //     DelFileMutationVariables
                              //   >({
                              //     mutation: DelFile,
                              //     variables: {
                              //       id: file._id,
                              //       branch: args.branch,
                              //     },
                              //   });

                              //   // update state
                              //   // setDelFile(file._id);
                              // } catch (err) {
                              //   console.error(JSON.stringify(err));
                              //   toast(err.message, {
                              //     type: 'error',
                              //   });
                              // } finally {
                              //   console.log('hello');
                              // }
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

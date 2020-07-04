import React from 'react';
import { Container, Table, Row, Col } from 'reactstrap';

import './index.scss';

import { useQuery } from '@apollo/react-hooks';
import { QueryResult } from '@apollo/react-common';
import { toast } from 'react-toastify';
import {
  Files,
  FilesQuery,
  FilesQueryVariables,
  FoldersQuery,
  FoldersQueryVariables,
  Folders,
} from 'lib/generated/datamodel';
import { isSSR } from 'utils/checkSSR';
import { AiFillFolder, AiOutlineFile } from 'react-icons/ai';
import { ObjectId } from 'mongodb';

interface FilesProps {
  repositoryName: string;
  repositoryID: ObjectId;
}

const perPage = 10;

const FilesList = (args: FilesProps): JSX.Element => {
  // TODO - get path from url
  const path = '/';
  // TODO - get branch from url
  const branch = 'master';
  const foldersRes:
    | QueryResult<FoldersQuery, FoldersQueryVariables>
    | undefined = isSSR
    ? undefined
    : useQuery<FoldersQuery, FoldersQueryVariables>(Folders, {
        variables: {
          repositories: [args.repositoryID],
          page: 0,
          perpage: perPage,
          branches: [branch],
          path,
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
          branches: [branch],
          path,
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
                        <Col>{folder.name}</Col>
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
                        <Col>{file.name}</Col>
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

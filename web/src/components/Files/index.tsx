import React, { useEffect, useState } from 'react';
import { Container, Table, Row, Col } from 'reactstrap';

import './index.scss';

import { toast } from 'react-toastify';
import {
  Files,
  FilesQuery,
  FilesQueryVariables,
  FoldersQuery,
  FoldersQueryVariables,
  Folders,
} from 'lib/generated/datamodel';
import { AiFillFolder, AiOutlineFile } from 'react-icons/ai';
import { ObjectId } from 'mongodb';
import { ApolloQueryResult, ApolloError } from 'apollo-client';
import { WindowLocation } from '@reach/router';
import { client } from 'utils/apollo';
import { Link } from 'gatsby';

interface FilesProps {
  repositoryName: string;
  repositoryOwner: string;
  repositoryID: ObjectId;
  defaultBranch: string;
  location: WindowLocation;
}

const perPage = 10;

const FilesList = (args: FilesProps): JSX.Element => {
  const [foldersRes, setFoldersRes] = useState<
    ApolloQueryResult<FoldersQuery> | undefined
  >(undefined);
  const [filesRes, setFilesRes] = useState<
    ApolloQueryResult<FilesQuery> | undefined
  >(undefined);
  const [branch, setBranch] = useState<string | undefined>(undefined);
  const [path, setPath] = useState<string>('/');
  useEffect(() => {
    let localBranch: string = args.defaultBranch;
    let localPath = '/';
    if (args.location.pathname.includes('tree')) {
      // in subtree
      const fullPath = args.location.pathname.split('tree')[1];
      localBranch = fullPath.substring(1);
      const lastSlash = localBranch.indexOf('/');
      if (lastSlash > 0) {
        localBranch = localBranch.substring(0, lastSlash);
      } else {
        localBranch = args.defaultBranch;
      }
      localPath = fullPath.substring(lastSlash + 1);
      if (localPath.length === 0 || localPath[localPath.length - 1] !== '/') {
        localPath += '/';
      }
    }
    setBranch(localBranch);
    setPath(localPath);
    (async (): Promise<void> => {
      try {
        setFoldersRes(
          await client.query<FoldersQuery, FoldersQueryVariables>({
            query: Folders,
            variables: {
              repositories: [args.repositoryID],
              page: 0,
              perpage: perPage,
              branches: [localBranch],
              path: localPath,
            },
            fetchPolicy: 'no-cache',
          })
        );
        setFilesRes(
          await client.query<FilesQuery, FilesQueryVariables>({
            query: Files,
            variables: {
              repositories: [args.repositoryID],
              page: 0,
              perpage: perPage,
              branches: [localBranch],
              path: localPath,
            },
            fetchPolicy: 'no-cache',
          })
        );
      } catch (err) {
        toast((err as ApolloError).message, {
          type: 'error',
        });
      }
    })();
  }, []);
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
                            to={`/${args.repositoryOwner}/${args.repositoryName}/tree/${branch}${path}${folder.name}`}
                          >
                            {folder.name}
                          </Link>
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

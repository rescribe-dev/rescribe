import React, { useEffect, useState } from 'react';
import {
  Container,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Col,
  Row,
} from 'reactstrap';

import './index.scss';

import { toast } from 'react-toastify';
import {
  FileNameExistsQuery,
  FileNameExistsQueryVariables,
  FileNameExists,
} from 'lib/generated/datamodel';
import ObjectId from 'bson-objectid';
import { WindowLocation } from '@reach/router';
import { client } from 'utils/apollo';
import FileView from './FileView';
import FolderView from './FolderView';
import { getFilePath } from 'shared/files';
import { Link } from 'gatsby';
import { ApolloError } from '@apollo/client';

interface FilesProps {
  repositoryName: string;
  repositoryOwner: string;
  repositoryID: ObjectId;
  defaultBranch: string;
  location: WindowLocation;
}

interface PathDescriptor {
  name: string;
  path: string;
}

const getPaths = (
  repoOwner: string,
  repoName: string,
  path: string
): PathDescriptor[] => {
  const res: PathDescriptor[] = [];
  const pathElements: string[] = [repoOwner, repoName].concat(
    path.split('/').filter((val) => val.length > 0)
  );

  let lastPath = '';

  for (let i = 0; i < pathElements.length; i++) {
    const pathElement = pathElements[i];
    if (i === 2) {
      lastPath += '/tree';
    }
    const currentPath = `${lastPath}/${pathElement}`;

    res.push({
      name: pathElement,
      path: currentPath,
    });

    lastPath = currentPath;
  }

  return res;
};

const FilesList = (args: FilesProps): JSX.Element => {
  const [branch, setBranch] = useState<string | undefined>(undefined);
  const [path, setPath] = useState<string>('/');
  const [loading, setLoading] = useState<boolean>(true);
  const [name, setName] = useState<string>('');
  const [fileView, setFileView] = useState<boolean>(false);
  const [branches] = useState<string[]>(['no other indexed branches']);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const toggle = () => setDropdownOpen((prevState) => !prevState);
  useEffect(() => {
    let localBranch: string = args.defaultBranch;
    let localPath = '/';
    let localName = '';
    if (args.location.pathname.includes('tree')) {
      // in subtree
      const pathWithBranch = args.location.pathname.split('tree')[1];
      localBranch = pathWithBranch.substring(1);
      let firstSlash = localBranch.indexOf('/');
      if (firstSlash < 0) {
        localBranch += '/';
        firstSlash = localBranch.length - 1;
      }
      localBranch = localBranch.substring(0, firstSlash);
      if (localBranch.length === 0) {
        localBranch = args.defaultBranch;
      }
      const fullPath = pathWithBranch.substring(firstSlash + 1);
      const folderData = getFilePath(fullPath);
      localPath = folderData.path;
      localName = folderData.name;
    }
    setBranch(localBranch);
    setPath(localPath);
    setName(localName);
    (async (): Promise<void> => {
      try {
        const fileExists = await client.query<
          FileNameExistsQuery,
          FileNameExistsQueryVariables
        >({
          query: FileNameExists,
          variables: {
            path: localPath,
            name: localName,
            repository: args.repositoryID,
            branch: localBranch,
          },
          fetchPolicy: 'no-cache',
        });
        setFileView(fileExists.data.fileNameExists);
        setLoading(false);
      } catch (err) {
        toast((err as ApolloError).message, {
          type: 'error',
        });
      }
    })();
  }, [args.location]);
  return (
    <Container>
      {loading || !branch ? (
        <p>loading...</p>
      ) : (
        <>
          <Container>
            <Row>
              <Col sm="auto">
                <Dropdown isOpen={dropdownOpen} toggle={toggle}>
                  <DropdownToggle caret>{branch}</DropdownToggle>
                  <DropdownMenu>
                    {branches.map((branch, i) => (
                      <DropdownItem key={`branch-${i}`}>{branch}</DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </Col>
              <Col md="auto" className="vertical-center">
                <Container>
                  <Row>
                    {getPaths(
                      args.repositoryOwner,
                      args.repositoryName,
                      path
                    ).map((pathData, i) => (
                      <React.Fragment key={`path-${i}`}>
                        <Col sm="auto">
                          <Link to={pathData.path}>{pathData.name}</Link>
                        </Col>
                        <Col
                          style={{
                            padding: 0,
                          }}
                        >
                          /
                        </Col>
                      </React.Fragment>
                    ))}
                    {name.length > 0 ? <Col>{name}</Col> : null}
                  </Row>
                </Container>
              </Col>
            </Row>
          </Container>
          {fileView ? (
            <FileView
              branch={branch}
              name={name}
              path={path}
              repositoryID={args.repositoryID}
            />
          ) : (
            <FolderView
              branch={branch}
              path={path}
              name={name}
              repositoryID={args.repositoryID}
              repositoryName={args.repositoryName}
              repositoryOwner={args.repositoryOwner}
            />
          )}
        </>
      )}
    </Container>
  );
};

export default FilesList;

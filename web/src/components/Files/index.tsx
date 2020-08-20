import React, { useEffect, useState } from 'react';
import { Container } from 'reactstrap';

import './index.scss';

import { toast } from 'react-toastify';
import {
  FileNameExistsQuery,
  FileNameExistsQueryVariables,
  FileNameExists,
} from 'lib/generated/datamodel';
import ObjectId from 'bson-objectid';
import { ApolloError } from 'apollo-client';
import { WindowLocation } from '@reach/router';
import { client } from 'utils/apollo';
import FileView from './FileView';
import FolderView from './FolderView';
import { getFilePath } from 'shared/files';

interface FilesProps {
  repositoryName: string;
  repositoryOwner: string;
  repositoryID: ObjectId;
  defaultBranch: string;
  location: WindowLocation;
}

const FilesList = (args: FilesProps): JSX.Element => {
  const [branch, setBranch] = useState<string | undefined>(undefined);
  const [path, setPath] = useState<string>('/');
  const [loading, setLoading] = useState<boolean>(true);
  const [name, setName] = useState<string>('');
  const [fileView, setFileView] = useState<boolean>(false);
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
      ) : fileView ? (
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
    </Container>
  );
};

export default FilesList;

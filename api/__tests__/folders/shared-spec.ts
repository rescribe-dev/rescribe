import { getParentFolderPath, FolderData, getParentFolderPaths } from '../../src/folders/shared';

test('Test get parent folder path', () => {
  const givenPath1 = getParentFolderPath('/folder1/folder2/test.txt');
  const expected1: FolderData = {
    name: 'folder2',
    path: '/folder1'
  };
  expect(givenPath1).toMatchObject(expected1);

  const givenPath2 = getParentFolderPath('/folder1/folder2');
  const expected2: FolderData = {
    name: 'folder1',
    path: '/'
  };
  expect(givenPath2).toMatchObject(expected2);

  const givenPath3 = getParentFolderPath('/');
  const expected3: FolderData = {
    name: '',
    path: ''
  };
  expect(givenPath3).toMatchObject(expected3);
});

test('Test get parent folder paths', () => {
  const givenPath1 = getParentFolderPaths('/folder1/folder2/test.txt');
  const expected1: FolderData[] = [
    {
      name: 'folder1',
      path: '/'
    },
    {
      name: 'folder2',
      path: '/folder1'
    }
  ];
  expect(givenPath1).toMatchObject(expected1);

  const givenPath2 = getParentFolderPaths('/folder1/test.txt');
  const expected2: FolderData[] = [
    {
      name: 'folder1',
      path: '/'
    }
  ];
  expect(givenPath2).toMatchObject(expected2);

  const givenPath3 = getParentFolderPaths('/folder1');
  const expected3: FolderData[] = [];
  expect(givenPath3).toMatchObject(expected3);
});

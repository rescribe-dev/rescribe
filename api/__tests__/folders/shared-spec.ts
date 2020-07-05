import { getParentFolderPath, PathData, getParentFolderPaths } from '../../src/shared/folders';

test('Test get parent folder path', () => {
  const givenPath1 = getParentFolderPath('/folder1/folder2/test.txt');
  const expected1: PathData = {
    name: 'folder2',
    path: '/folder1'
  };
  expect(givenPath1).toMatchObject(expected1);

  const givenPath2 = getParentFolderPath('/folder1/folder2');
  const expected2: PathData = {
    name: 'folder1',
    path: '/'
  };
  expect(givenPath2).toMatchObject(expected2);

  const givenPath3 = getParentFolderPath('/');
  const expected3: PathData = {
    name: '',
    path: ''
  };
  expect(givenPath3).toMatchObject(expected3);

  const givenPath4 = getParentFolderPath('/folder1');
  const expected4: PathData = {
    name: '',
    path: ''
  };
  expect(givenPath4).toMatchObject(expected4);
});

test('Test get parent folder paths', () => {
  const givenPath1 = getParentFolderPaths('/folder1/folder2/test.txt');
  const expected1: PathData[] = [
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
  const expected2: PathData[] = [
    {
      name: 'folder1',
      path: '/'
    }
  ];
  expect(givenPath2).toMatchObject(expected2);

  const givenPath3 = getParentFolderPaths('/folder1');
  const expected3: PathData[] = [];
  expect(givenPath3).toMatchObject(expected3);
});

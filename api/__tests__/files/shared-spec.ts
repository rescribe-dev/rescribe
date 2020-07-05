import { getFilePath } from '../../src/shared/files';
import { PathData } from '../../src/shared/folders';

test('Test get file path', () => {
  const givenPath1 = getFilePath('/folder1/folder2/test.txt');
  const expected1: PathData = {
    name: 'test.txt',
    path: '/folder1/folder2/'
  };
  expect(givenPath1).toMatchObject(expected1);

  const givenPath2 = getFilePath('/');
  const expected2: PathData = {
    name: '',
    path: '/'
  };
  expect(givenPath2).toMatchObject(expected2);
});

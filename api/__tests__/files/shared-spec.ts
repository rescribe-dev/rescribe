import { getFilePath } from '../../src/files/shared';

test('Test get file path', () => {
  const givenPath1 = getFilePath('/folder1/folder2/test.txt');
  expect(givenPath1).toMatch('/folder1/folder2');
  const givenPath2 = getFilePath('/');
  expect(givenPath2).toMatch('/');
});

import internal from 'stream';

export const streamToString = (stream: internal.Readable): Promise<string> => {
  const chunks: Uint8Array[] = [];
  return new Promise<string>((resolve, reject) => {
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
};

export const binaryMimeType = 'application/octet-stream';

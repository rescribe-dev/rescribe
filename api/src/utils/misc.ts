import internal from 'stream';

export const streamToString = (stream: internal.Readable): Promise<string> => {
  const chunks: Uint8Array[] = [];
  return new Promise<string>((resolve, reject) => {
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
};

const textMimes = new Set<string>(['application/json', 'application/ld+json']);

export const checkText = (mime: string): boolean => {
  return mime.startsWith('text/') || textMimes.has(mime);
};

const mediaMimes: string[] = ['image/', 'video/', 'audio/'];

export const checkMedia = (mime: string): boolean => {
  return mediaMimes.some(start => mime.startsWith(start));
};

export const contentTypeHeader = 'content-type';

export const propertyOf = <TObj>(name: keyof TObj): string => name as string;

export const uniformSpacing = (input: string): string => {
  return input.trim().replace(/\s+/g, ' ');
};

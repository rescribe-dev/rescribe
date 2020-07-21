// from https://raw.githubusercontent.com/netlify/cli/master/src/utils/headers.js

import fs from 'fs';
import { relative } from 'path';

const TOKEN_COMMENT = '#';
const TOKEN_PATH = '/';

interface headers {
  [header: string]: string[];
}

interface data {
  [path: string]: headers;
}

export const renderQuery = '_render';
export const renderHeader = 'x-prerender';
export const originalUserAgentHeader = 'x-user-agent';
export const userAgentHeader = 'user-agent';

const headersFile = relative(process.cwd(), './_headers');

export const invalidHeaders = [
  'Connection', 'Expect', 'Keep-Alive', 'Proxy-Authenticate', 'Proxy-Authorization',
  'Proxy-Connection', 'Trailer', 'Upgrade', 'X-Accel-Buffering', 'X-Accel-Charset',
  'X-Accel-Limit-Rate', 'X-Accel-Redirect', 'X-Cache', 'X-Forwarded-Proto', 'X-Real-IP'
];

export const invalidHeaderPrefixes = [
  'X-Amz-Cf-', 'X-Amzn-', 'X-Edge-'
];

export const parseHeadersFile = (): data => {
  const rules: data = {};
  if (!fs.existsSync(headersFile)) return rules;
  if (fs.statSync(headersFile).isDirectory()) {
    console.warn('expected _headers file but found a directory at:', headersFile);
    return rules;
  }

  const lines = fs.readFileSync(headersFile, { encoding: 'utf8' }).split('\n');
  if (lines.length < 1) return rules;

  let path: string | undefined = undefined;
  for (let i = 0; i <= lines.length; i++) {
    if (!lines[i]) continue;

    const line = lines[i].trim();

    if (line.startsWith(TOKEN_COMMENT) || line.length < 1) continue;
    if (line.startsWith(TOKEN_PATH)) {
      if (line.includes('*') && line.indexOf('*') !== line.length - 1) {
        throw new Error(`invalid rule (A path rule cannot contain anything after * token) at line: ${i}\n${lines[i]}\n`);
      }
      path = line;
      continue;
    }

    if (!path) throw new Error('path should come before headers');

    if (line.includes(':')) {
      const sepIndex = line.indexOf(':');
      if (sepIndex < 1) throw new Error(`invalid header at line: ${i}\n${lines[i]}\n`);

      const key = line.substr(0, sepIndex).trim();
      const value = line.substr(sepIndex + 1).trim();

      if (path in rules) {
        if (key in rules[path]) {
          rules[path][key].push(value);
        } else {
          rules[path][key] = [value];
        }
      } else {
        rules[path] = { [key]: [value] };
      }
    }
  }
  return rules;
};

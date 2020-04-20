import axios, { AxiosError, AxiosInstance } from 'axios';


let antlrURI: string;

let antlrClient: AxiosInstance;

export interface IProcessFileOutput {
  name: string;
  content: string;
  returnType: string | undefined;
  startIndex: number;
  endIndex: number;
}

export interface IProcessFileInput {
  name: string;
  contents: string;
}

export const processFile = (inputData: IProcessFileInput): Promise<IProcessFileOutput[]> => {
  return antlrClient.post<IProcessFileOutput[]>('/processFile', inputData).then(res => {
    if (res.status === 200) {
      return res.data;
    } else {
      throw new Error(`invalid response status ${res.status}`)
    }
  }).catch((err: AxiosError) => {
    throw new Error(err.message);
  });
}

export const pingAntlr = (): Promise<boolean> => {
  return antlrClient.get('/ping').then(res => {
    if (res.status === 200) {
      return true;
    }
    return false;
  }).catch((err: AxiosError) => {
    throw new Error(err.message);
  });
}

export const initializeAntlr = (): Promise<boolean> => {
  if (!process.env.ANTLR_URI) {
    throw new Error('cannot find antlr uri');
  }
  antlrURI = process.env.ANTLR_URI;
  antlrClient = axios.create({
    baseURL: antlrURI,
    headers: {
      common: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json',
        Pragma: 'no-cache',
      },
    },
    timeout: 3000,
  })
  return pingAntlr().then((res) => {
    return res
  }).catch((err: Error) => {
    const message = `cannot connect to antlr server: ${err.message}`;
    throw new Error(message);
  })
}

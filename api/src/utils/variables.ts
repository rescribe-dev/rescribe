export const specialCharacterRegex = /[!@#$%^&*(),.?":{}|<>]/;
export const validProjectName = /^[A-z0-9-_]+$/;
export const validRepositoryName = /^[A-z0-9-_]+$/;
export const blacklistedRepositoryNames = ['projects'];
export const passwordMinLen = 6;
export const nameMinLen = 3;
export const queryMinLength = 3;

export const saltRounds = 10;

// supported languages:

export enum Language {
  java = 'java',
  javascript = 'javascript',
}

export const languageColorMap: {[key: string]: number} = {};

languageColorMap[Language.java] = 0xF0AD4E;
languageColorMap[Language.javascript] = 0x0275D8; // switch to hex

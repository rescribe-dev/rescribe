export const capitalLetterRegex = /[A-Z]/;
export const lowercaseLetterRegex = /[a-z]/;
export const numberRegex = /[0-9]/;
export const specialCharacterRegex = /[!@#$%^&*(),.?":{}|<>]/;
export const validProjectName = /^[A-z0-9-_]+$/;
export const validRepositoryName = /^[A-z0-9-_]+$/;
export const blacklistedRepositoryNames = ['projects'];
export const passwordMinLen = 6;
export const minJWTLen = 30;
export const queryMinLength = 3;

export const defaultRepositoryImage = 'https://example.com/image.jpg';
export const saltRounds = 10;

// supported languages:

export enum Language {
  none = 'none',
  java = 'java',
  javascript = 'javascript',
}

export const languageColorMap: {[key: string]: number} = {};

languageColorMap[Language.java] = 0xF0AD4E;
languageColorMap[Language.javascript] = 0x0275D8; // switch to hex

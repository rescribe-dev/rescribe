import { config } from 'dotenv';
import fs from 'fs';

import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';
import { ParseTreeWalker } from 'antlr4ts/tree/ParseTreeWalker';
import { Python3Lexer } from './grammar/gen/python/Python3Lexer';
import { Python3Listener } from './grammar/gen/python/Python3Listener';
import {
  FuncdefContext,
  Python3Parser,
} from './grammar/gen/python/Python3Parser';

// Create the lexer and parser

const data = fs.readFileSync('./test.py').toString();

// console.log(data);

const inputStream = new ANTLRInputStream(data.toString());
const lexer = new Python3Lexer(inputStream);
const tokenStream = new CommonTokenStream(lexer);
const parser = new Python3Parser(tokenStream);

const tree = parser.file_input();

class EnterFunctionListener implements Python3Listener {
  // Assuming a parser rule with name: `functionDeclaration`
  public enterFuncdef(context: FuncdefContext) {
    if (context.children) {
      console.log(`function ${context.children[1].text}`);
    }
    console.log(`starts on line ${context._start.line}`);
  }
  public exitFuncdef(context: FuncdefContext) {
    console.log(`ends on line ${context._start.line}\n`);
  }
}

const listener: Python3Listener = new EnterFunctionListener();
// Use the entry point for listeners
ParseTreeWalker.DEFAULT.walk(listener, tree);

const runAPI = () => {
  config();
  console.log(`Hello world 🚀`);
};

if (!module.parent) {
  runAPI();
}

export default runAPI;

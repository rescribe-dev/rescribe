import fs from 'fs';

import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';
import { ParseTreeWalker } from 'antlr4ts/tree/ParseTreeWalker';

import { CPP14Lexer } from './grammar/gen/cpp/CPP14Lexer';
import { CPP14Listener } from './grammar/gen/cpp/CPP14Listener';
import {
  CPP14Parser,
  FunctiondefinitionContext,
} from './grammar/gen/cpp/CPP14Parser';

export default () => {
  const data = fs.readFileSync('./samples/test.cpp').toString();

  // console.log(data);

  const inputStream = new ANTLRInputStream(data.toString());
  const lexer = new CPP14Lexer(inputStream);
  const tokenStream = new CommonTokenStream(lexer);
  const parser = new CPP14Parser(tokenStream);

  const tree = parser.declarationseq();

  class EnterFunctionListener implements CPP14Listener {
    // Assuming a parser rule with name: `functionDeclaration`
    public enterFunctiondefinition(context: FunctiondefinitionContext) {
      if (context.children) {
        console.log(`function ${context.children[0].text}`);
      }
      console.log(`starts on line ${context._start.line}`);
    }

    public exitFunctiondefinition(context: FunctiondefinitionContext) {
      console.log(`ends on line ${context._start.line}\n`);
    }
  }

  const listener: CPP14Listener = new EnterFunctionListener();
  // Use the entry point for listeners
  ParseTreeWalker.DEFAULT.walk(listener, tree);
}

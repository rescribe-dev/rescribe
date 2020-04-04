import fs from 'fs';

import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';
import { ParseTreeWalker } from 'antlr4ts/tree/ParseTreeWalker';

import { JavaLexer } from './grammar/gen/java/JavaLexer';
import {
  JavaParser,
  MethodDeclarationContext,
} from './grammar/gen/java/JavaParser';
import { JavaParserListener } from './grammar/gen/java/JavaParserListener';

export default () => {
  const data = fs.readFileSync('./samples/test.java').toString();

  // console.log(data);

  const inputStream = new ANTLRInputStream(data.toString());
  const lexer = new JavaLexer(inputStream);
  const tokenStream = new CommonTokenStream(lexer);
  const parser = new JavaParser(tokenStream);

  const tree = parser.classBodyDeclaration();

  class EnterFunctionListener implements JavaParserListener {
    // Assuming a parser rule with name: `functionDeclaration`
    public enterMethodDeclaration(context: MethodDeclarationContext) {
      if (context.children) {
        console.log(`function ${context.children[1].text}`);
      }
      console.log(`starts on line ${context._start.line}`);
    }

    public exitMethodDeclaration(context: MethodDeclarationContext) {
      console.log(`ends on line ${context._start.line}\n`);
    }
  }

  const listener: JavaParserListener = new EnterFunctionListener();
  // Use the entry point for listeners
  ParseTreeWalker.DEFAULT.walk(listener, tree);
}

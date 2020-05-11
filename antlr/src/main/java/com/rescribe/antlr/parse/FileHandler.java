package com.rescribe.antlr.parse;

import com.rescribe.antlr.gen.cpp.CPP14Lexer;
import com.rescribe.antlr.gen.cpp.CPP14Parser;
import com.rescribe.antlr.gen.java.JavaLexer;
import com.rescribe.antlr.gen.java.JavaParser;
import com.rescribe.antlr.gen.python3.Python3Lexer;
import com.rescribe.antlr.gen.python3.Python3Parser;
import com.rescribe.antlr.parse.exceptions.UnsupportedFileException;
import com.rescribe.antlr.parse.listeners.CPPDeclarationListener;
import com.rescribe.antlr.parse.listeners.JavaDeclarationListener;
import com.rescribe.antlr.parse.listeners.Python3DeclarationListener;
import com.rescribe.antlr.parse.schema.File;
import org.antlr.v4.runtime.CharStreams;
import org.antlr.v4.runtime.CommonTokenStream;
import org.antlr.v4.runtime.tree.ParseTree;
import org.antlr.v4.runtime.tree.ParseTreeWalker;

public class FileHandler {

  private static String getFileExtension(String name) {
    String extension = "";
    int i = name.lastIndexOf('.');
    int p = Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\'));
    if (i > p) {
      extension = name.substring(i + 1);
    }
    return extension.replaceAll("\\s", "");
  }

  public static File getFileData(FileInput input) throws UnsupportedFileException {
    String file_extension = getFileExtension(input.getFileName());
    ParseTreeWalker walker = new ParseTreeWalker();
    ParseTree tree;
    CustomListener listener;
    switch (file_extension) {
      case "java":
        {
          JavaLexer lexer = new JavaLexer(CharStreams.fromString(input.getContent()));
          CommonTokenStream tokens = new CommonTokenStream(lexer);
          JavaParser parser = new JavaParser(tokens);
          tree = parser.compilationUnit();
          JavaDeclarationListener jdl =
              new JavaDeclarationListener(tokens, input.getFileName(), input.getPath());
          walker.walk(jdl, tree);
          listener = jdl;
          break;
        }
      case "cpp":
        {
          CPP14Lexer lexer = new CPP14Lexer(CharStreams.fromString(input.getContent()));
          CommonTokenStream tokens = new CommonTokenStream(lexer);
          CPP14Parser parser = new CPP14Parser(tokens);
          tree = parser.translationunit();
          CPPDeclarationListener cdl =
              new CPPDeclarationListener(tokens, input.getFileName(), input.getPath());
          walker.walk(cdl, tree);
          listener = cdl;
          break;
        }
      case "py":
        {
          Python3Lexer lexer = new Python3Lexer(CharStreams.fromString(input.getContent()));
          CommonTokenStream tokens = new CommonTokenStream(lexer);
          Python3Parser parser = new Python3Parser(tokens);
          tree = parser.file_input();
          Python3DeclarationListener p3dl =
              new Python3DeclarationListener(tokens, input.getFileName(), input.getPath());
          walker.walk(p3dl, tree);
          listener = p3dl;
          break;
        }
      default:
        throw new UnsupportedFileException(file_extension);
    }
    return listener.getFileData();
  }
}

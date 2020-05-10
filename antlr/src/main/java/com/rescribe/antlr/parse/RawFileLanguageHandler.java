package com.rescribe.antlr.parse;

import com.rescribe.antlr.gen.cpp.CPP14Lexer;
import com.rescribe.antlr.gen.cpp.CPP14Parser;
import com.rescribe.antlr.gen.java.JavaLexer;
import com.rescribe.antlr.gen.java.JavaParser;
import com.rescribe.antlr.gen.python3.Python3Lexer;
import com.rescribe.antlr.gen.python3.Python3Parser;
import com.rescribe.antlr.parse.listeners.CPPDeclarationListener;
import com.rescribe.antlr.parse.listeners.JavaDeclarationListener;
import com.rescribe.antlr.parse.listeners.Python3DeclarationListener;
import java.io.BufferedReader;
import java.io.FileReader;
import org.antlr.v4.runtime.CharStreams;
import org.antlr.v4.runtime.CommonTokenStream;
import org.antlr.v4.runtime.tree.ParseTree;
import org.antlr.v4.runtime.tree.ParseTreeWalker;

public class RawFileLanguageHandler {

  public static IllegalArgumentException illegal_argument_exception;

  public static ParseTree getJavaParseTree(String file_contents) {
    JavaLexer lexer = new JavaLexer(CharStreams.fromString(file_contents));
    CommonTokenStream tokens = new CommonTokenStream(lexer);
    JavaParser parser = new JavaParser(tokens);
    return parser.compilationUnit();
  }

  public static ParseTree getCppParseTree(String file_contents) {
    CPP14Lexer lexer = new CPP14Lexer(CharStreams.fromString(file_contents));
    CommonTokenStream tokens = new CommonTokenStream(lexer);
    CPP14Parser parser = new CPP14Parser(tokens);
    return parser.translationunit();
  }

  public static ParseTree getPython3ParseTree(String file_contents) {
    Python3Lexer lexer = new Python3Lexer(CharStreams.fromString(file_contents));
    CommonTokenStream tokens = new CommonTokenStream(lexer);
    Python3Parser parser = new Python3Parser(tokens);
    return parser.file_input();
  }

  public static void main(String[] args) throws Exception {
    if (args.length == 0) {
      System.out.println("Wrong number of arguments. This takes one or more filepaths\n");
      throw illegal_argument_exception;
    }

    for (String path : args) {
      Reader reader = new Reader(path);
      String file_contents = reader.readFile();
      String file_extension = reader.getFileExtension();
      ParseTreeWalker walker = new ParseTreeWalker();
      switch (file_extension) {
        case "java":
          {
            ParseTree tree = getJavaParseTree(file_contents);
            JavaDeclarationListener jdl = new JavaDeclarationListener(path);
            walker.walk(jdl, tree);
            break;
          }
        case "cpp":
          {
            ParseTree tree = getCppParseTree(file_contents);
            CPPDeclarationListener cdl = new CPPDeclarationListener(path);
            walker.walk(cdl, tree);
            break;
          }
        case "py":
          {
            ParseTree tree = getPython3ParseTree(file_contents);
            Python3DeclarationListener p3dl = new Python3DeclarationListener(path);
            walker.walk(p3dl, tree);
            break;
          }
        default:
          System.out.println("unsupported file extension");
          break;
      }
    }
  }

  private static class Reader {
    private final String path;
    private final BufferedReader br;

    public Reader(String p) throws Exception {
      this.path = p;
      FileReader fr = new FileReader(path);
      br = new BufferedReader(fr);
    }

    public String readFile() throws Exception {
      StringBuilder sb = new StringBuilder();
      String contents;
      while ((contents = this.br.readLine()) != null) {
        sb.append(contents).append('\n');
      }
      return sb.toString();
    }

    public String getFileExtension() {
      String extension = "";
      int i = path.lastIndexOf('.');
      int p = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
      if (i > p) {
        extension = path.substring(i + 1);
      }
      return extension.replaceAll("\\s", "");
    }
  }
}

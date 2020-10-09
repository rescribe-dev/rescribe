package com.rescribe.antlr.parse;

import com.rescribe.antlr.gen.java.JavaLexer;
import com.rescribe.antlr.gen.java.JavaParser;
import com.rescribe.antlr.gen.javascript.JavaScriptLexer;
import com.rescribe.antlr.gen.javascript.JavaScriptParser;
import com.rescribe.antlr.parse.exceptions.UnsupportedFileException;
import com.rescribe.antlr.parse.listeners.*;
import com.rescribe.antlr.parse.schema.File;
import com.rescribe.antlr.parse.schema.LanguageType;
import org.antlr.v4.runtime.CharStreams;
import org.antlr.v4.runtime.CommonTokenStream;
import org.antlr.v4.runtime.tree.ParseTree;
import org.antlr.v4.runtime.tree.ParseTreeWalker;

import com.google.common.util.concurrent.SimpleTimeLimiter;
import com.google.common.util.concurrent.TimeLimiter;
import java.util.concurrent.Callable;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

public class FileHandler {

  private final static int timeout = 10; //seconds

  private static String getFileExtension(String name) {
    String extension = "";
    int i = name.lastIndexOf('.');
    int p = Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\'));
    if (i > p) {
      extension = name.substring(i + 1);
    }
    return extension.replaceAll("\\s", "");
  }

  public static File getFileData(FileInput input) throws UnsupportedFileException, TimeoutException, Exception {
    System.out.println("Enter file handler");
    String file_extension = getFileExtension(input.getFileName());
    ParseTreeWalker walker = new ParseTreeWalker();
    ParseTree tree;
    CustomListener listener;
    TimeLimiter limiter = SimpleTimeLimiter.create(Executors.newCachedThreadPool());

    switch (file_extension) {
      case "java":
        {

          JavaLexer lexer = new JavaLexer(CharStreams.fromString(input.getContent()));
          CommonTokenStream tokens = new CommonTokenStream(lexer);
          JavaParser parser = new JavaParser(tokens);

          long startTime = System.nanoTime();
          try {
            tree = limiter.callWithTimeout((Callable<ParseTree>) () -> {
                return parser.compilationUnit();
            }, timeout, TimeUnit.SECONDS);
          } catch (TimeoutException e) {
              System.out.println("Timeout for parser.compilationUnit");
              throw e;
          } catch (Throwable e) {
              System.out.println("Error for parser.compilationUnit");
              throw e;
          }

          JavaDeclarationListener jdl =
              new JavaDeclarationListener(tokens, input, LanguageType.java);
          walker.walk(jdl, tree);
          listener = jdl;
          break;
        }
        // case "cpp":
        //   {
        //     CPP14Lexer lexer = new CPP14Lexer(CharStreams.fromString(input.getContent()));
        //     CommonTokenStream tokens = new CommonTokenStream(lexer);
        //     CPP14Parser parser = new CPP14Parser(tokens);
        //     tree = parser.translationunit();
        //     CPPDeclarationListener cdl = new CPPDeclarationListener(tokens, input);
        //     walker.walk(cdl, tree);
        //     listener = cdl;
        //     break;
        //   }
      case "py":
        {
          throw new IllegalArgumentException("python not supported yet");
          /*
          Python3Lexer lexer = new Python3Lexer(CharStreams.fromString(input.getContent()));
          CommonTokenStream tokens = new CommonTokenStream(lexer);
          Python3Parser parser = new Python3Parser(tokens);
          tree = parser.file_input();
          Python3DeclarationListener p3dl = new Python3DeclarationListener(tokens, input);
          walker.walk(p3dl, tree);
          listener = p3dl;
          break;
          */
        }
      case "js":
        {
          JavaScriptLexer lexer = new JavaScriptLexer(CharStreams.fromString(input.getContent()));
          CommonTokenStream tokens = new CommonTokenStream(lexer);
          JavaScriptParser parser = new JavaScriptParser(tokens);
          tree = parser.program();
          JavaScriptDeclarationListener jsdl =
              new JavaScriptDeclarationListener(tokens, input, LanguageType.javascript);
          walker.walk(jsdl, tree);
          listener = jsdl;
          break;
        }
      default:
        throw new UnsupportedFileException(file_extension);
    }
    return listener.getFileData();
  }
}

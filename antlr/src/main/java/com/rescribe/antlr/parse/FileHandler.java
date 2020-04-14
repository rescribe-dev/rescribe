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
import org.antlr.v4.runtime.CharStreams;
import org.antlr.v4.runtime.CommonTokenStream;
import org.antlr.v4.runtime.tree.ParseTree;
import org.antlr.v4.runtime.tree.ParseTreeWalker;

import java.util.List;

public class FileHandler {

    public static ParseTree getJavaParseTree(String file_contents) {
        JavaLexer lexer = new JavaLexer(CharStreams.fromString(file_contents));
        CommonTokenStream tokens = new CommonTokenStream(lexer);
        JavaParser parser = new JavaParser(tokens);
        ParseTree tree = parser.compilationUnit();
        return tree;

    }

    public static ParseTree getCppParseTree(String file_contents) {
        CPP14Lexer lexer = new CPP14Lexer(CharStreams.fromString(file_contents));
        CommonTokenStream tokens = new CommonTokenStream(lexer);
        CPP14Parser parser = new CPP14Parser(tokens);
        ParseTree tree = parser.translationunit();
        return tree;
    }

    public static ParseTree getPython3ParseTree(String file_contents) {
        Python3Lexer lexer = new Python3Lexer(CharStreams.fromString(file_contents));
        CommonTokenStream tokens = new CommonTokenStream(lexer);
        Python3Parser parser = new Python3Parser(tokens);
        ParseTree tree = parser.file_input();
        return tree;
    }

    private static String getFileExtension(String name) {
        String extension = "";
        int i = name.lastIndexOf('.');
        int p = Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\'));
        if (i > p) {
            extension = name.substring(i + 1);
        }
        return extension.replaceAll("\\s", "");
    }

    public static List<FunctionDefinitionOutput> getFileData(FileInput input) throws UnsupportedFileException {
        String file_extension = getFileExtension(input.getName());
        ParseTreeWalker walker = new ParseTreeWalker();
        ParseTree tree;
        CustomListener listener;
        switch (file_extension) {
            case "java":
                tree = getJavaParseTree(input.getContents());
                JavaDeclarationListener jdl = new JavaDeclarationListener();
                walker.walk(jdl, tree);
                listener = jdl;
                break;
            case "cpp":
                tree = getCppParseTree(input.getContents());
                CPPDeclarationListener cdl = new CPPDeclarationListener();
                walker.walk(cdl, tree);
                listener = cdl;
                break;
            case "py":
                tree = getPython3ParseTree(input.getContents());
                Python3DeclarationListener p3dl = new Python3DeclarationListener();
                walker.walk(p3dl, tree);
                listener = p3dl;
                break;
            default:
                throw new UnsupportedFileException(file_extension);
        }
        return listener.getResults();
    }
}


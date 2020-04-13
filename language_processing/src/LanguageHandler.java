import grammar.gen.cpp.CPP14Lexer;
import grammar.gen.cpp.CPP14Parser;
import grammar.gen.java.*;
import grammar.gen.python3.*;
import java.io.*;

import grammar.gen.python3.Python3Parser;
import org.antlr.v4.runtime.CharStreams;
import org.antlr.v4.runtime.CommonTokenStream;
import org.antlr.v4.runtime.tree.*;
public class LanguageHandler {

    public static IllegalArgumentException illegal_argument_exception;

    public static ParseTree getJavaParseTree(String file_contents){
        JavaLexer lexer = new JavaLexer(CharStreams.fromString(file_contents));
        CommonTokenStream tokens = new CommonTokenStream(lexer);
        JavaParser parser = new JavaParser(tokens);
        ParseTree tree = parser.compilationUnit();
        return tree;

    }

    public static ParseTree getCppParseTree(String file_contents){
        CPP14Lexer lexer = new CPP14Lexer(CharStreams.fromString(file_contents));
        CommonTokenStream tokens = new CommonTokenStream(lexer);
        CPP14Parser parser = new CPP14Parser(tokens);
        ParseTree tree = parser.translationunit();
        return tree;
    }

    public static ParseTree getPython3ParseTree(String file_contents){
        Python3Lexer lexer = new Python3Lexer(CharStreams.fromString(file_contents));
        CommonTokenStream tokens = new CommonTokenStream(lexer);
        Python3Parser parser = new Python3Parser(tokens);
        ParseTree tree = parser.file_input();
        return tree;
    }

    public static void main(String[] args) throws Exception{
        if (args.length == 0) {
            System.out.println("Wrong number of arguments. This takes one or more filepaths\n");
            throw illegal_argument_exception;
        }

        for (String path : args) {

            Reader reader = new Reader(path);
            String file_contents = reader.readFile();
            String file_extension = reader.getFileExtension();

            ParseTreeWalker walker = new ParseTreeWalker();

            if (file_extension.equals("java")) {
                ParseTree tree = getJavaParseTree(file_contents);
                JavaDeclarationListener jdl = new JavaDeclarationListener();
                walker.walk(jdl, tree);
            } else if (file_extension.equals("cpp")) {
                ParseTree tree = getCppParseTree(file_contents);
                CppDeclarationListener cdl = new CppDeclarationListener();
                walker.walk(cdl, tree);
            } else if (file_extension.equals("py")) {
                ParseTree tree = getPython3ParseTree(file_contents);
                Python3DeclarationListener p3dl = new Python3DeclarationListener();
                walker.walk(p3dl, tree);
            } else {
                System.out.println("unsupported file extension");
            }
        }

    }


    static class Reader {
        private String contents;
        private String path;
        private FileReader fr;
        private BufferedReader br;

        public Reader(String p) throws Exception{
            this.path = p;
            fr = new FileReader(path);
            br = new BufferedReader(fr);
        }

        public String readFile() throws Exception{
            StringBuilder sb = new StringBuilder();
            while((contents = this.br.readLine()) != null){
                sb.append(contents + '\n');
            }
            return sb.toString();
        }

        public String getFileExtension(){
            String extension = "";
            int i = path.lastIndexOf('.');
            int p = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
            if (i > p) {
                extension = path.substring(i+1);
            }
            return extension.replaceAll("\\s", "");
        }
    }
}

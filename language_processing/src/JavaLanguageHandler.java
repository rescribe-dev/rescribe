import grammar.gen.java.*;
import java.io.*;
import org.antlr.v4.runtime.CharStreams;
import org.antlr.v4.runtime.CommonTokenStream;
import org.antlr.v4.runtime.tree.*;

public class JavaLanguageHandler {
    public static void main(String[] args) throws Exception{
        String path = "/home/mycicle/git/rescribe/language_processing/test/Go.java";
        Reader reader = new Reader(path);
        String java_file_content = reader.readFile();
        JavaLexer lexer = new JavaLexer(CharStreams.fromString(java_file_content));
        CommonTokenStream tokens = new CommonTokenStream(lexer);
        JavaParser parser = new JavaParser(tokens);
        ParseTree tree = parser.compilationUnit();
        ParseTreeWalker walker = new ParseTreeWalker();
        JavaDeclarationListener jdl = new JavaDeclarationListener();

        walker.walk(jdl, tree);

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
    }
    static class JavaDeclarationListener extends JavaParserBaseListener {
        public JavaDeclarationListener(){ super(); }
        @Override public void enterMethodDeclaration(JavaParser.MethodDeclarationContext ctx){
//            System.out.println(ctx.formalParameters());
            if (ctx.children != null){
                System.out.println("Method Name: " + ctx.children.get(1));
                System.out.println("Takes Arguments: " + ctx.formalParameters().getText());
            }
            System.out.println("Starts on line: " + ctx.start.getLine());
            System.out.println("Ends on line: " + ctx.stop.getLine());
            System.out.println("Content is: " + ctx.getText());
            System.out.println("\n");
        }
    }
}

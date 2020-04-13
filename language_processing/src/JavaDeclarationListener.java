import grammar.gen.java.JavaParser;
import grammar.gen.java.JavaParserBaseListener;

public class JavaDeclarationListener extends JavaParserBaseListener {
    public JavaDeclarationListener() { super(); }
    @Override public void enterMethodDeclaration(JavaParser.MethodDeclarationContext ctx){
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
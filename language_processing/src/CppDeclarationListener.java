import grammar.gen.cpp .CPP14BaseListener;
import grammar.gen.cpp.CPP14Parser;

public class CppDeclarationListener extends CPP14BaseListener{
    public CppDeclarationListener() { super(); }
    @Override public void enterFunctiondefinition(CPP14Parser.FunctiondefinitionContext ctx){
        if (ctx.children != null){
            System.out.println("Method Name: " + ctx.children.get(1).getText());
            System.out.println("Method Return Type: " + ctx.children.get(0).getText());
            System.out.println("Content is: " + ctx.functionbody().getText());
        }
        System.out.println("Starts on line: " + ctx.start.getLine());
        System.out.println("Ends on line: " + ctx.stop.getLine());
//        System.out.println("Content is: " + ctx.getText());
        System.out.println("\n");
    }
}

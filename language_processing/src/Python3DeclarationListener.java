import grammar.gen.python3.Python3BaseListener;
import grammar.gen.python3.Python3Parser;

public class Python3DeclarationListener extends Python3BaseListener {
    public Python3DeclarationListener() { super(); }

    @Override public void enterFuncdef(Python3Parser.FuncdefContext ctx) {
        if (ctx.children != null){
            System.out.println("Declaration type: " + ctx.children.get(0).getText());
            System.out.println("Method Name: " + ctx.children.get(1).getText());
            System.out.println("Method Arguments: " + ctx.children.get(2).getText());
            System.out.println("Method Delimiter: " + ctx.children.get(3).getText());
            System.out.println("Method Contents: " + ctx.children.get(4).getText());
        }
        else {
            System.out.println("Null context children");
        }
    }
}

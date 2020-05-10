package com.rescribe.antlr.parse.visitors;

import com.rescribe.antlr.gen.java.JavaParser;
import com.rescribe.antlr.gen.java.JavaParserBaseVisitor;
import com.rescribe.antlr.parse.schema.Function;
import com.rescribe.antlr.parse.schema.Variable;
import org.antlr.v4.runtime.tree.ParseTree;

public class JavaDeclarationVisitor extends JavaParserBaseVisitor {
  public final int depth, max_depth;

  public JavaDeclarationVisitor() {
    super();
    this.max_depth = 7;
    this.depth = 0;
  }

  @Override
  public Function visitMethodDeclaration(JavaParser.MethodDeclarationContext ctx) {
    Function currentFunction = new Function();
    if (ctx.getChildCount() >= 4) {
      currentFunction.setReturnType(ctx.children.get(0).getText());
      currentFunction.setName(ctx.children.get(1).getText());
      if (ctx.children.get(2).getChildCount() == 3) {
        ParseTree arguments = ctx.children.get(2).getChild(1);
        for (int i = 0; i < arguments.getChildCount(); i++) {
          ParseTree currentVariableData = arguments.getChild(i);
          if (currentVariableData.getChildCount() >= 2) {
            Variable currentVariable = new Variable();
            currentVariable.setType(currentVariableData.getChild(0).getText());
            currentVariable.setName(currentVariableData.getChild(1).getText());
            currentFunction.getArguments().add(currentVariable);
          }
        }
      }
    }
    return currentFunction;
  }

  //    @Override
  //    public Results visitClassBody(JavaParser.ClassBodyContext ctx) {
  //        int n = ctx.getChildCount();
  //        if (n > 0) {
  //            for (int i = 0; i < n; i++) {
  //                this.visitParseTree(ctx.children.get(i));
  //                this.depth = 0;
  //            }
  //        }
  //        String r;
  //        for (int j = 0; j < this.tempResults.size(); j++) {
  //            if ((r = tempResults.get(j)) != null) {
  //                results.addResults(r);
  //            }
  //        }
  //        return this.results;
  //    }

  //    public Results visitClassBodyDeclaration(List<JavaParser.ClassBodyDeclarationContext> ctx) {
  //        for (JavaParser.ClassBodyDeclarationContext c : ctx) {
  //            results.addResults(c.getClass().toGenericString());
  //        }
  //        return this.results;
  //    }

  //    public String visitParseTree(ParseTree ctx) {
  //        this.depth++;
  //        if (this.depth > max_depth) {
  //            return ctx.getText();
  //        }
  //        int n = ctx.getChildCount();
  //        ArrayList<String> al = new ArrayList<>();
  //        if (n > 0) {
  //            for (int i = 0; i < n; i++){
  //                al.add(this.visitParseTree(ctx.getChild(i)));
  //            }
  //            tempResults.addResults(al);
  //            return null;
  //        }
  //
  //        return ctx.getText();
  //    }
}

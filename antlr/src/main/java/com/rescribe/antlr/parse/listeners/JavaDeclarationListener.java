package com.rescribe.antlr.parse.listeners;

import com.rescribe.antlr.gen.java.JavaParser;
import com.rescribe.antlr.gen.java.JavaParserBaseListener;
import com.rescribe.antlr.parse.CustomListener;
import com.rescribe.antlr.parse.results.ClassResults;
import com.rescribe.antlr.parse.results.Results;
import com.rescribe.antlr.parse.visitors.JavaDeclarationVisitor;
import java.util.ArrayList;
import java.util.List;

public class JavaDeclarationListener extends JavaParserBaseListener implements CustomListener {

  List<Results> results;

  Results constructor;
  List<Results> methods;
  List<Results> variables;
  List<ClassResults> class_results;

  boolean in_class;
  String current_classname;

  JavaDeclarationVisitor visitor;

  public JavaDeclarationListener() {
    super();

    this.results = new ArrayList<>();

    this.constructor = new Results();
    this.methods = new ArrayList<>();
    this.variables = new ArrayList<>();
    this.class_results = new ArrayList<>();

    this.in_class = false;
    this.current_classname = "";

    this.visitor = new JavaDeclarationVisitor();
  }

  @Override
  public void enterImportDeclaration(JavaParser.ImportDeclarationContext ctx) {
    super.enterImportDeclaration(ctx);
  }

  public List<Results> getResults() {
    if (class_results != null) {
      for (Results r : this.class_results) {
        results.add(r);
      }
    }

    // DO THE SAME FOR METHODS AND VARIABLES WHEN THOSE ARE IMPLEMENTED
    return this.results;
  }

  private void resetContext() {
    this.constructor = new Results();
    this.methods = new ArrayList<>();
    this.variables = new ArrayList<>();
    this.in_class = false;
    this.current_classname = "";
  }

  @Override
  public void enterClassDeclaration(JavaParser.ClassDeclarationContext ctx) {
    this.resetContext();
    this.in_class = true;
    this.current_classname = ctx.children.get(1).getText();
  }

  @Override
  public void enterMethodDeclaration(JavaParser.MethodDeclarationContext ctx) {
    Results output = this.visitor.visitMethodDeclaration(ctx);

    if (in_class) {
      output.setParent(this.current_classname);
      output.setResultsType("class method");
    }

    this.methods.add(output);
  }

  @Override
  public void exitClassDeclaration(JavaParser.ClassDeclarationContext ctx) {
    this.class_results.add(
        new ClassResults(
            ctx.classBody().getText(),
            new Results(),
            this.methods,
            new ArrayList<>(),
            this.current_classname));
    this.resetContext();
  }

  @Override
  public void enterGenericMethodDeclaration(JavaParser.GenericMethodDeclarationContext ctx) {
    results.add(new Results(ctx.getText(), "generic method declaration"));
  }

  //          results.add(
  //                  visitor.visitClassBodyDeclaration(ctx.classBody().classBodyDeclaration())
  //          );

  //      for (JavaParser.ClassBodyDeclarationContext i : ctx.classBody().classBodyDeclaration()) {
  //        JavaResults.add(visitor.visitClassBodyDeclaration(i));
  //      }
  //      this.current_classname =
  // ctx.classBody().classBodyDeclaration(2).memberDeclaration().children.get(0).getChild(1).getText();
  //      results.add(
  //              new Results(current_classname, "class")
  //      );
  //      String full = ctx.classBody().classBodyDeclaration(2).memberDeclaration().getText();
  //      results.add(
  //              new Results(full, "this is the output of full")
  //      );
  //      full = ctx.classBody().classBodyDeclaration(10).memberDeclaration().getText();
  //      results.add(
  //              new Results(full, "this is the output of full")
  //      );

  //  @Override
  //  public void enterClassDeclaration(JavaParser.ClassDeclarationContext ctx) {
  //    if (ctx.children == null) {
  //      return;
  //    }
  //    results.add(
  //            new Results(ctx.classBody().children.get(5).getClass().getSimpleName(), "class")
  //    );
  //    if (ctx.classBody() != null) {
  //      results.add(
  //              visitor.visitClassBody(ctx.classBody())
  //      );
  //    }
  //
  ////    for (int i = 0; i < ctx.classBody().children.size(); i++) {
  ////      results.add(
  ////              new Results(ctx.classBody().children.get(i).getText(), "class")
  ////      );
  ////    }
  //
  //  }
  //
  //  @Override
  //  public void enterMethodDeclaration(JavaParser.MethodDeclarationContext ctx) {
  //    if (ctx.children == null) {
  //      return;
  //    }
  //
  //    results.add(
  //            new Results(ctx.getText(), "function")
  //    );
  //
  //  }
  //
  //  //this will return the name of the variable: its parent will be the type and the name with no
  // spaces ex: intx;
  //  @Override
  //  public void enterVariableDeclarators(JavaParser.VariableDeclaratorsContext ctx) {
  //    if (ctx.children == null) {
  //      return;
  //    }
  //
  ////    results.add(
  ////            new Results(ctx.getText(), "variable")
  ////    );
  //  }
  //
  //  //this will also return the name of the variable
  //  @Override
  //  public void enterVariableDeclarator(JavaParser.VariableDeclaratorContext ctx) {
  //    if (ctx.children == null) {
  //      return;
  //    }
  //
  ////    results.add(
  ////            new Results(ctx.parent.getText(), "variable")
  ////    );
  //  }
  //
  //  //this will capture what every variable is initialized to. Ex; if int x = 0; this outputs 0,
  // if ArrayList ar = new ArrayList<>(); this outputs newArrayList<>()
  //  //the parent is the variable name. so in the above case, parent.getText() returns x=0
  //  @Override
  //  public void enterVariableInitializer(JavaParser.VariableInitializerContext ctx) {
  //    if (ctx.children == null) {
  //      return;
  //    }
  //
  //    results.add(
  //            new Results(ctx.parent.getText(), "variable")
  //    );
  //  }
  //
  //  @Override
  //  public void enterMethodCall(JavaParser.MethodCallContext ctx) {
  //    super.enterMethodCall(ctx);
  //  }
}

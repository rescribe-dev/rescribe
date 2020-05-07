package com.rescribe.antlr.parse.listeners;

import com.rescribe.antlr.gen.java.JavaParser;
import com.rescribe.antlr.gen.java.JavaParserBaseListener;
import com.rescribe.antlr.parse.CustomListener;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import com.rescribe.antlr.parse.visitors.JavaDeclarationVisitor;

import com.rescribe.antlr.parse.results.Results;

public class JavaDeclarationListener extends JavaParserBaseListener implements CustomListener {


  public List<Results> results;
  public JavaDeclarationVisitor visitor;
  private boolean inClass;
  private String current_classname;

  HashMap<String, Results> resultsHashMap;

  public JavaDeclarationListener() {
    super();
    this.results = new ArrayList<>();
    this.visitor = new JavaDeclarationVisitor();
    this.inClass = false;
    this.resultsHashMap = new HashMap<>();
  }

  public List<Results> getResults() {
    return this.results;
  }

    @Override
    public void enterClassDeclaration(JavaParser.ClassDeclarationContext ctx) {
      this.inClass = true;
      this.current_classname = ctx.children.get(1).getText();

    }

    @Override
    public void enterMethodDeclaration(JavaParser.MethodDeclarationContext ctx) {
      Results output = visitor.visitMethodDeclaration(ctx);
      if (inClass == true) {
        output.setParent(this.current_classname);
        output.setResultsType("class method");
      }
      resultsHashMap.put(output.getLabel(), output);
      results.add(
              output
      );
    }

    @Override
    public void exitClassDeclaration(JavaParser.ClassDeclarationContext ctx) {
      this.inClass = false;
      this.current_classname = null;
    }

    @Override
    public void enterGenericMethodDeclaration(JavaParser.GenericMethodDeclarationContext ctx) {
      results.add(
        new Results(ctx.getText(), "generic method declaration")
      );
    }



//          results.add(
//                  visitor.visitClassBodyDeclaration(ctx.classBody().classBodyDeclaration())
//          );

//      for (JavaParser.ClassBodyDeclarationContext i : ctx.classBody().classBodyDeclaration()) {
//        JavaResults.add(visitor.visitClassBodyDeclaration(i));
//      }
//      this.current_classname = ctx.classBody().classBodyDeclaration(2).memberDeclaration().children.get(0).getChild(1).getText();
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
//  //this will return the name of the variable: its parent will be the type and the name with no spaces ex: intx;
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
//  //this will capture what every variable is initialized to. Ex; if int x = 0; this outputs 0, if ArrayList ar = new ArrayList<>(); this outputs newArrayList<>()
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

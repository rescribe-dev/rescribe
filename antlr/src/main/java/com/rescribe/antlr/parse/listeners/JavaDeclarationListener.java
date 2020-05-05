package com.rescribe.antlr.parse.listeners;

import com.rescribe.antlr.gen.java.JavaParser;
import com.rescribe.antlr.gen.java.JavaParserBaseListener;
import com.rescribe.antlr.parse.CustomListener;

import java.util.ArrayList;
import java.util.List;

import com.rescribe.antlr.parse.results.Results;

public class JavaDeclarationListener extends JavaParserBaseListener implements CustomListener {


  public List<Results> results;

  public JavaDeclarationListener() {
    super();
    this.results = new ArrayList<>();
  }

  public List<Results> getResults() {
    return this.results;
  }


  @Override
  public void enterClassDeclaration(JavaParser.ClassDeclarationContext ctx) {
    if (ctx.children == null) {
      return;
    }

    results.add(
            new Results(ctx.classBody().getText(), "class")
    );

  }

  @Override
  public void enterMethodDeclaration(JavaParser.MethodDeclarationContext ctx) {
    if (ctx.children == null) {
      return;
    }

    results.add(
            new Results(ctx.getText(), "function")
    );

  }

  //this will return the name of the variable: its parent will be the type and the name with no spaces ex: intx;
  @Override
  public void enterVariableDeclarators(JavaParser.VariableDeclaratorsContext ctx) {
    if (ctx.children == null) {
      return;
    }

//    results.add(
//            new Results(ctx.getText(), "variable")
//    );
  }

  //this will also return the name of the variable
  @Override
  public void enterVariableDeclarator(JavaParser.VariableDeclaratorContext ctx) {
    if (ctx.children == null) {
      return;
    }

//    results.add(
//            new Results(ctx.parent.getText(), "variable")
//    );
  }

  //this will capture what every variable is initialized to. Ex; if int x = 0; this outputs 0, if ArrayList ar = new ArrayList<>(); this outputs newArrayList<>()
  //the parent is the variable name. so in the above case, parent.getText() returns x=0
  @Override
  public void enterVariableInitializer(JavaParser.VariableInitializerContext ctx) {
    if (ctx.children == null) {
      return;
    }

    results.add(
            new Results(ctx.parent.getText(), "variable")
    );
  }

  @Override
  public void enterMethodCall(JavaParser.MethodCallContext ctx) {
    super.enterMethodCall(ctx);
  }
}

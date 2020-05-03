package com.rescribe.antlr.parse.listeners;

import com.rescribe.antlr.parse.*;
import com.rescribe.antlr.gen.java.JavaParser;
import com.rescribe.antlr.gen.java.JavaParserBaseListener;
import com.rescribe.antlr.parse.CustomListener;
import com.rescribe.antlr.parse.FunctionDefinitionOutput;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;

public class JavaDeclarationListener extends JavaParserBaseListener implements CustomListener {
  @Getter List<FunctionDefinitionOutput> functionResults;
  @Getter List<ClassDefinitionOutput> classResults;

  public List<ClassDefinitionOutput> getResults() {
    return this.classResults;
  }

  public JavaDeclarationListener() {
    super();
    functionResults = new ArrayList<>();
    classResults = new ArrayList<>();
  }

  @Override
  public void enterClassDeclaration(JavaParser.ClassDeclarationContext ctx) {
    if (ctx.children == null) {
      return;
    }
    String a = ctx.children.get(0).getText(); //this is the class keyword - type
    String s = ctx.children.get(1).getText(); //this is the name
//    String d = ctx.children.get(2).getText(); //This is the same as getClassBody which returns
    //a blob of the class content
    //there are only three children
    String d = ctx.classBody().children.get(1).getText();
    String f = ctx.classBody().children.get(2).getText();

    String g = ctx.classBody().getText();
    Integer h = ctx.start.getLine();
    Integer j = ctx.stop.getLine();

    classResults.add(new ClassDefinitionOutput(a, s, d, f, g, h, j));
  }

  @Override
  public void enterMethodDeclaration(JavaParser.MethodDeclarationContext ctx) {
    if (ctx.children == null) {
      return;
    }
    String methodName = ctx.children.get(1).getText();
    String methodArguments = ctx.children.get(2).getText();
    String methodReturnType = ctx.children.get(0).getText();
    String bodyContent = ctx.methodBody().getText();
    Integer startLine = ctx.start.getLine();
    Integer endLine = ctx.stop.getLine();
    functionResults.add(
        new FunctionDefinitionOutput(
            methodName, methodArguments, bodyContent, methodReturnType, startLine, endLine));
  }

  @Override
  public void enterMethodCall(JavaParser.MethodCallContext ctx) {
    super.enterMethodCall(ctx);
  }
}

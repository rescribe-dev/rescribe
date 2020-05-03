package com.rescribe.antlr.parse.listeners;

import com.rescribe.antlr.gen.java.JavaParser;
import com.rescribe.antlr.gen.java.JavaParserBaseListener;
import com.rescribe.antlr.parse.CustomListener;
import com.rescribe.antlr.parse.FunctionDefinitionOutput;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;

public class JavaDeclarationListener extends JavaParserBaseListener implements CustomListener {
  @Getter List<FunctionDefinitionOutput> results;
  @Getter List<ClassDefinitionOutput> cdo;
  public JavaDeclarationListener() {
    super();
    results = new ArrayList<>();
  }

  @Override
  public void enterClassDeclaration(JavaParser.ClassDeclarationContext ctx) {
    if (ctx.children == null) {
      return;
    }

  }

  @Override
  public void enterMethodDeclaration(JavaParser.MethodDeclarationContext ctx) {
    if (ctx.children == null) {
      return;
    }
    String methodName = ctx.children.get(1).getText();
    String methodReturnType = ctx.children.get(0).getText();
    String bodyContent = ctx.methodBody().getText();
    Integer startLine = ctx.start.getLine();
    Integer endLine = ctx.stop.getLine();
    results.add(
        new FunctionDefinitionOutput(
            methodName, bodyContent, methodReturnType, startLine, endLine));
  }

  @Override
  public void enterMethodCall(JavaParser.MethodCallContext ctx) {
    super.enterMethodCall(ctx);
  }
}

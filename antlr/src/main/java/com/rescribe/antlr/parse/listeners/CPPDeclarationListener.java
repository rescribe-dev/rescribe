package com.rescribe.antlr.parse.listeners;

import com.rescribe.antlr.gen.cpp.CPP14BaseListener;
import com.rescribe.antlr.gen.cpp.CPP14Parser;
import com.rescribe.antlr.parse.CustomListener;
import java.util.ArrayList;
import java.util.List;

import com.rescribe.antlr.parse.results.Results;
import lombok.Getter;

public class CPPDeclarationListener extends CPP14BaseListener implements CustomListener {
  @Getter List<Results> classResults;
  public List<Results> getResults(){
    return classResults;
  }
  public CPPDeclarationListener() {
    super();
    classResults = new ArrayList<>();
  }

  @Override
  public void enterFunctiondefinition(CPP14Parser.FunctiondefinitionContext ctx) {
    if (ctx.children == null) {
      return;
    }
    String methodName = ctx.children.get(1).getText();
    String methodArguments = ctx.children.get(2).getText();
    String methodReturnType = ctx.children.get(0).getText();
    String bodyContent = ctx.functionbody().getText();
    Integer startLine = ctx.start.getLine();
    Integer endLine = ctx.stop.getLine();
    // String allContent = ctx.getText();
  }
}

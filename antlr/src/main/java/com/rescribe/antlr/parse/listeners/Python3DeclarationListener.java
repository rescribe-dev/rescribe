package com.rescribe.antlr.parse.listeners;

import com.rescribe.antlr.gen.python3.Python3BaseListener;
import com.rescribe.antlr.gen.python3.Python3Parser;
import com.rescribe.antlr.parse.CustomListener;
import com.rescribe.antlr.parse.FunctionDefinitionOutput;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;

public class Python3DeclarationListener extends Python3BaseListener implements CustomListener {
  @Getter List<FunctionDefinitionOutput> results;

  public Python3DeclarationListener() {
    super();
    results = new ArrayList<>();
  }

  @Override
  public void enterFuncdef(Python3Parser.FuncdefContext ctx) {
    if (ctx.children == null) {
      return;
    }
    String methodName = ctx.children.get(1).getText();
    String methodReturnType = "";
    String bodyContent = ctx.children.get(4).getText();
    Integer startLine = ctx.start.getLine();
    Integer endLine = ctx.stop.getLine();
    results.add(
        new FunctionDefinitionOutput(
            methodName, methodReturnType, bodyContent, startLine, endLine));
  }
}

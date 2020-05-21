package com.rescribe.antlr.parse.listeners;

import com.rescribe.antlr.gen.python3.Python3BaseListener;
import com.rescribe.antlr.gen.python3.Python3Parser;
import com.rescribe.antlr.parse.CustomListener;
import com.rescribe.antlr.parse.schema.File;
import lombok.Getter;
import org.antlr.v4.runtime.BufferedTokenStream;

public class Python3DeclarationListener extends Python3BaseListener implements CustomListener {
  @Getter File file;
  BufferedTokenStream tokens;

  public File getFileData() {
    return file;
  }

  public Python3DeclarationListener(BufferedTokenStream tokens, String filename, String path) {
    super();
    this.tokens = tokens;
    this.file = new File(filename, path);
  }

  @Override
  public void enterFuncdef(Python3Parser.FuncdefContext ctx) {
    if (ctx.children == null) {
      return;
    }
    String methodName = ctx.children.get(1).getText();
    String methodArguments = ctx.children.get(2).getText();
    String methodReturnType = "";
    String bodyContent = ctx.children.get(4).getText();
    Integer startLine = ctx.start.getLine();
    Integer endLine = ctx.stop.getLine();
  }
}

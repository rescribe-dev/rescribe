package com.rescribe.antlr.parse.listeners;

import com.rescribe.antlr.gen.java.JavaParser;
import com.rescribe.antlr.gen.java.JavaParserBaseListener;
import com.rescribe.antlr.parse.CustomListener;
import com.rescribe.antlr.parse.FunctionDefinitionOutput;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

public class JavaDeclarationListener extends JavaParserBaseListener implements CustomListener {
    @Getter
    List<FunctionDefinitionOutput> results;
    public JavaDeclarationListener() {
        super();
        results = new ArrayList<>();
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
        results.add(new FunctionDefinitionOutput(methodName, methodReturnType, bodyContent, startLine, endLine));
    }
}
package com.rescribe.antlr.parse.listeners;

import static java.lang.Math.abs;

import com.rescribe.antlr.gen.java.TypeScriptParser;
import com.rescribe.antlr.gen.java.TypeScriptParserBaseListener;
import com.rescribe.antlr.parse.FileInput;
import com.rescribe.antlr.parse.schema.*;
import com.rescribe.antlr.parse.schema.Class;
import java.util.ArrayList;
import java.util.List;
import java.util.Stack;
import org.antlr.v4.runtime.BufferedTokenStream;
import org.antlr.v4.runtime.ParserRuleContext;
import org.antlr.v4.runtime.Token;
import org.antlr.v4.runtime.tree.ParseTree;

public class TypescriptDeclarationListener extends TypeScriptParserBaseListener implements CustomListener {
    File file;
    BufferedTokenStream tokens;
    Stack<Parent> parents = new Stack<>();

    public TypescriptDeclarationListener (BufferedTokenStream tokens, FileInput input) {
        super();
        this.tokens = tokens;
        this.file = new File(input);
        parents.push(new Parent(this.file.get_id(), ParentType.File));
    }
    public File getFileData(){return this.file;}

    @Override
    public void enterFunctionType(TypeScriptParser.FunctionTypeContext ctx) {
        for (int i = 0; i < ctx.children.size(); i++) {
            System.out.println(ctx.children.get(i).getText());
        }
    }
}
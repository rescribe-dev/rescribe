/*
package com.rescribe.antlr.parse.listeners;

import static java.lang.Math.abs;

import com.rescribe.antlr.gen.typescript.TypeScriptParser;
import com.rescribe.antlr.gen.typescript.TypeScriptParserBaseListener;
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
        System.out.println("HELLO WORLD");
    }
    public File getFileData(){return this.file;}

    public void testContext(ParserRuleContext ctx, String title) {
        System.out.println(title);
        System.out.println(ctx.getPayload());
        System.out.println("num children : " + ctx.children.size());
        for (int i = 0; i < ctx.children.size(); i++) {
            System.out.println(ctx.children.get(i).getText());
        }
    }

    @Override
    public void enterInitializer(TypeScriptParser.InitializerContext ctx) {
        testContext(ctx, "enter initializer");
    }

    @Override
    public void enterTypeParameters(TypeScriptParser.TypeParametersContext ctx) {
        testContext(ctx, "enter type parameters");

    }

    @Override
    public void enterTypeParameterList(TypeScriptParser.TypeParameterListContext ctx) {
        testContext(ctx, "enter type parameter list");
    }

    @Override
    public void enterTypeParameter(TypeScriptParser.TypeParameterContext ctx) {
        testContext(ctx, "enter type parameter - singular");
    }

    @Override
    public void enterConstraint(TypeScriptParser.ConstraintContext ctx) {
        testContext(ctx, "enter constraint");
    }

    @Override
    public void enterTypeArguments(TypeScriptParser.TypeArgumentsContext ctx) {
        testContext(ctx, "enter type arguments");
    }

    @Override
    public void enterTypeArgumentList(TypeScriptParser.TypeArgumentListContext ctx) {
        testContext(ctx, "enter type arguments list");
    }

    @Override
    public void enterTypeArgument(TypeScriptParser.TypeArgumentContext ctx) {
        testContext(ctx, "enter type argument - singular");
    }

    @Override
    public void enterFunctionType(TypeScriptParser.FunctionTypeContext ctx) {
        testContext(ctx, "enter function type");
    }

    @Override
    public void enterType_(TypeScriptParser.Type_Context ctx) {
        testContext(ctx, "enter type");
    }

    @Override
    public void enterTypeQuery(TypeScriptParser.TypeQueryContext ctx) {
        testContext(ctx, "enter type query");
    }

    @Override
    public void enterTypeQueryExpression(TypeScriptParser.TypeQueryExpressionContext ctx) {
        testContext(ctx, "enter type query expression");
    }

    @Override
    public void enterPropertySignatur(TypeScriptParser.PropertySignaturContext ctx) {
        testContext(ctx, "enter property signature");
    }

    @Override
    public void enterTypeAnnotation(TypeScriptParser.TypeAnnotationContext ctx) {
        testContext(ctx, "enter type annotation");
    }

    @Override
    public void enterParameterList(TypeScriptParser.ParameterListContext ctx) {
        testContext(ctx, "enter parameter list");
    }

    @Override
    public void enterRequiredParameterList(TypeScriptParser.RequiredParameterListContext ctx) {
        testContext(ctx, "enter required parameter list");
    }

    @Override
    public void enterParameter(TypeScriptParser.ParameterContext ctx) {
        testContext(ctx, "enter parameter");
    }
}
*/

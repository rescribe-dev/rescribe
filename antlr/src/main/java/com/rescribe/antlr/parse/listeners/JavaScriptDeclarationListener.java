package com.rescribe.antlr.parse.listeners;

import static java.lang.Math.abs;

import com.rescribe.antlr.gen.javascript.*;
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

//though this is labelled as javascript and uses the javascript grammars from the
//antlr4 grammars repo, the grammar is stated to be stable for ecma 6

public class JavaScriptDeclarationListener extends JavaScriptParserBaseListener implements CustomListener {
    File file;
    BufferedTokenStream tokens;
    Stack<Parent> parents = new Stack<>();

    public JavaScriptDeclarationListener(BufferedTokenStream tokens, FileInput input) {
        super();
        this.tokens = tokens;
        this.file = new File(input);
        parents.push(new Parent(this.file.get_id(), ParentType.File));
        System.out.println("hello world");
    }

    public File getFileData() {
        return this.file;
    }

    public void testContext(ParserRuleContext ctx, String title) {
        System.out.println(title);
        System.out.println("num children : " + ctx.children.size());
        System.out.println("children  num children : " + ctx.children.get(0).getChildCount());
        for (int i = 0; i < ctx.children.size(); i++) {
            System.out.println(ctx.children.get(i).getText());
        }
        System.out.println("---");
        System.out.println("---");
        System.out.println("---");
    }


    //this gives you the entire program in one long string and then the <EOF>
    @Override
    public void enterProgram(JavaScriptParser.ProgramContext ctx) {
        testContext(ctx, "enter program");
    }

    @Override
    public void enterFunctionDeclaration(JavaScriptParser.FunctionDeclarationContext ctx) {
        testContext(ctx, "enter function declaration");
    }

    @Override
    public void enterClassDeclaration(JavaScriptParser.ClassDeclarationContext ctx) {
        testContext(ctx, "enter class declaration");
    }

    @Override
    public void enterMethodDefinition(JavaScriptParser.MethodDefinitionContext ctx) {
        testContext(ctx, "enter method definition");
    }

    //this will give you all of the function bodies, inner functions will get marked as new functions
    //and not trigger this it also doesnt provide the name / params of the function but it does give you
    //the body   1 child
//    @Override
//    public void enterFunctionBody(JavaScriptParser.FunctionBodyContext ctx) {
//        testContext(ctx, "enter function body");
//    }

    //this is going to give you anything in a parenthesis that follows a function call
    //they dont always come out in order, but in the case of main.js in the demo code you get
    //principal years rate
    //click
    //principal
    //years
    //calcBtn
    //rate
    //monthlyPayment
    //2
    //that entire callback function from document.addEventListener
//    @Override
//    public void enterArguments(JavaScriptParser.ArgumentsContext ctx) {
//        testContext(ctx, "enter arguments");
//    }

    //this will give you everything thats not an argument in parenthesis recursively
    //for example we get the conditions within if statements, return variables / values
    //but without the word return
    //if you had the expression (1 - (Math.pow(1 / (1 + monthlyRate), years * 12)))
    //you get that, 1+monthlyRate, Math.pow(1 / (1 + monthlyRate), years * 12), 1/(1 + monthlyRate), etc

//    @Override
//    public void enterExpressionSequence(JavaScriptParser.ExpressionSequenceContext ctx) {
//        testContext(ctx, "enter expression sequence");
//    }

    @Override
    public void enterObjectLiteralExpression(JavaScriptParser.ObjectLiteralExpressionContext ctx) {
        testContext(ctx, "enter object literal expression");
    }

    @Override
    public void enterMetaExpression(JavaScriptParser.MetaExpressionContext ctx) {
        testContext(ctx, "enter meta expression");
    }

    //better enter function body as the beginning yields the function(args) syntax as well
    @Override
    public void enterFunctionExpression(JavaScriptParser.FunctionExpressionContext ctx) {
        testContext(ctx, "enter function expression");
    }

    //when something is assigned this triggers but not all of the time
    @Override
    public void enterAssignmentExpression(JavaScriptParser.AssignmentExpressionContext ctx) {
        testContext(ctx, "assignment expression context");
    }

    @Override
    public void enterImportExpression(JavaScriptParser.ImportExpressionContext ctx) {
        testContext(ctx, "enter import expression");
    }

    @Override
    public void enterRelationalExpression(JavaScriptParser.RelationalExpressionContext ctx) {
        testContext(ctx, "enter relational expression");
    }

    @Override
    public void enterNewExpression(JavaScriptParser.NewExpressionContext ctx) {
        testContext(ctx, "enter new expression");
    }


    //important
    @Override
    public void enterMemberDotExpression(JavaScriptParser.MemberDotExpressionContext ctx) {
        testContext(ctx, "enter member dot expression");
    }

    //these are entering variable names
    @Override
    public void enterAssignable(JavaScriptParser.AssignableContext ctx) {
        testContext(ctx, "enter assignable");
    }

    //this one is important
    @Override
    public void enterObjectLiteral(JavaScriptParser.ObjectLiteralContext ctx) {
        testContext(ctx, "object literal");
    }

    @Override
    public void enterFunctionDecl(JavaScriptParser.FunctionDeclContext ctx) {
        testContext(ctx, "enter function decl context");
    }

    //this is going to be the good stuff it contains the function declaration and args along with content
    //vry similar to function expression but the function args are broken down more
    //doesnt take the variable name that the value / function is assigned to
    @Override
    public void enterAnoymousFunctionDecl(JavaScriptParser.AnoymousFunctionDeclContext ctx) {
        testContext(ctx, "enter anonymous function decl context");
    }
//important
    @Override
    public void enterArrowFunction(JavaScriptParser.ArrowFunctionContext ctx) {
        testContext(ctx, "enter arrow function");
    }
//important
    @Override
    public void enterArrowFunctionParameters(JavaScriptParser.ArrowFunctionParametersContext ctx) {
        testContext(ctx, "enter arrow function parameters");
    }
//important
    @Override
    public void enterArrowFunctionBody(JavaScriptParser.ArrowFunctionBodyContext ctx) {
        testContext(ctx, "enter arrow function body");
    }
//important
    @Override
    public void enterAssignmentOperator(JavaScriptParser.AssignmentOperatorContext ctx) {
        testContext(ctx, "enter assignment operator");
    }
}
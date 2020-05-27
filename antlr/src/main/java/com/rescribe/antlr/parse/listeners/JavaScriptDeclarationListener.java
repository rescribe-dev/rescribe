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


/* GOING TO BE USED */

    //90% of the things Ive seen in testing are assignables, object literals,
    //anonymous function declarations, and member dot expressions
    /*DOCUMENTED*/

    //these are entering variable names
    //for assignables the parent yields the entire expression ex: thing = something else
    //the parent of the parent yields either var thing = something else or for arguments it
    //yields all of the arguments of the function
    @Override
    public void enterAssignable(JavaScriptParser.AssignableContext ctx) {
        testContext(ctx, "enter assignable");
    }

    //the children of this are the function keyword, the arguments, and the content of the function
    //if you break it down further you get all of the sub expressions but we dont need those
    @Override
    public void enterAnoymousFunctionDecl(JavaScriptParser.AnoymousFunctionDeclContext ctx) {
        testContext(ctx, "enter anonymous function decl context");

        //if there are six children its an anonymous function delcared with the function syntax with
        //no arguments
        if(ctx.getChildCount() == 6) {
            System.out.println(ctx.children.get(0).getText()); // this is the function keyword
            System.out.println(ctx.children.get(4).getText()); // this is the content
        }
    }

    //three parent children gives you all of the expression with the syntax
    //something = document.getwhatever(adasfd).asdf

    //two parent children gives you all of the standalone expressions with no further frills
    //math.pow(thing)
    //document.getwhatever(asdfd)
    //it also may give you a massively long dot expression if there is a callback internal to it
    //in that case it will give you the entire callback. I recommend three parent children as the
    //set to be used
    @Override
    public void enterMemberDotExpression(JavaScriptParser.MemberDotExpressionContext ctx) {
//        testContext(ctx, "enter member dot expression");
        if (ctx.getParent().getChildCount() == 3) {
            System.out.println("enter member dot expression");
            System.out.println(ctx.getParent().getText());
            System.out.println("---");
            System.out.println("---");
            System.out.println("---");
        }
    }

    //this gives you a list of all of the members within the object literal declaration
    //with a child being each member of the object literal and all of the commas and brackets
    //ex: {nav:hash[0],anchor:decodeURIComponent(hash[1]||'')}   =
    //{
    //nav:hash[0]
    //,
    //anchor:decodeURIComponent(hash[1]||'')
    //}
    //the parents children are the name of the storage varible, an equals sign, and the raw members
    //within the object literal declaration
    //ex: ditto = {stuff} =
    //ditto
    //=
    //{stuff}
    //and the stuffs children behave as described above
    @Override
    public void enterObjectLiteralExpression(JavaScriptParser.ObjectLiteralExpressionContext ctx) {
        testContext(ctx, "enter object literal expression");
        for (int i = 0; i < ctx.getParent().getChildCount(); i++) {
            System.out.println(ctx.getParent().getChild(i).getText());
        }
    }
    /*DOCUMENTED*/

    @Override
    public void enterClassDeclaration(JavaScriptParser.ClassDeclarationContext ctx) {
        testContext(ctx, "enter class declaration");
    }

    @Override
    public void enterImportExpression(JavaScriptParser.ImportExpressionContext ctx) {
        testContext(ctx, "enter import expression");
    }

    @Override
    public void enterArrowFunction(JavaScriptParser.ArrowFunctionContext ctx) {
        testContext(ctx, "enter arrow function");
    }
}
/* GOING TO BE USED */


    /*MAYBE GOING TO BE USED*/
//    @Override
//    public void enterArrowFunctionParameters(JavaScriptParser.ArrowFunctionParametersContext ctx) {
//        testContext(ctx, "enter arrow function parameters");
//    }
//    @Override
//    public void enterFunctionDeclaration(JavaScriptParser.FunctionDeclarationContext ctx) {
//        testContext(ctx, "enter function declaration");
//    }
//    @Override
//    public void enterMethodDefinition(JavaScriptParser.MethodDefinitionContext ctx) {
//        testContext(ctx, "enter method definition");
//    }
//    @Override
//    public void enterMetaExpression(JavaScriptParser.MetaExpressionContext ctx) {
//        testContext(ctx, "enter meta expression");
//    }
//    //when something is assigned this triggers but not all of the time
//    @Override
//    public void enterAssignmentExpression(JavaScriptParser.AssignmentExpressionContext ctx) {
//        testContext(ctx, "assignment expression context");
//    }
//    @Override
//    public void enterFunctionDecl(JavaScriptParser.FunctionDeclContext ctx) {
//        testContext(ctx, "enter function decl context");
//    }
//    @Override
//    public void enterArrowFunctionBody(JavaScriptParser.ArrowFunctionBodyContext ctx) {
//        testContext(ctx, "enter arrow function body");
//    }
//    @Override
//    public void enterAssignmentOperator(JavaScriptParser.AssignmentOperatorContext ctx) {
//        testContext(ctx, "enter assignment operator");
//    }
//    basically a child of the object literal expression
//    @Override
//    public void enterObjectLiteral(JavaScriptParser.ObjectLiteralContext ctx) {
//        testContext(ctx, "object literal");
//    }
    /*MAYBE GOING TO BE USED*/

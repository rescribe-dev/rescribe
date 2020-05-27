package com.rescribe.antlr.parse.listeners;

import static java.lang.Math.abs;

import com.rescribe.antlr.gen.javascript.*;
import com.rescribe.antlr.parse.FileInput;
import com.rescribe.antlr.parse.exceptions.UnsupportedFileException;
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

    public JavaScriptDeclarationListener(BufferedTokenStream tokens, FileInput input, LanguageType languageType) {
        super();
        this.tokens = tokens;
        this.file = new File(input);
        parents.push(new Parent(this.file.get_id(), ParentType.File));
        this.file.setLanguage(languageType);
    }

    public File getFileData() {
        if(this.file.getLanguage() == LanguageType.DEFAULT){
            throw new UnsupportedFileException("Unexpected file extension");
        }
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

    public Boolean hasCallabck(String input) {
        return input.contains("function(");
    }
/* GOING TO BE USED */
    //TODO parents
    //90% of the things Ive seen in testing are assignables, object literals,
    //anonymous function declarations, and member dot expressions
    /*DOCUMENTED*/
    //these are entering variable names
    //for assignables the parent yields the entire expression ex: thing = something else
    //the parent of the parent yields either var thing = something else or for arguments it
    //yields all of the arguments of the function
    //this procs on function assignemnts too
    @Override
    public void enterAssignable(JavaScriptParser.AssignableContext ctx) {
        Variable newVariable = new Variable();
        if (ctx.getParent() != null && ctx.getParent().getChildCount() >= 3) {
            if (!hasCallabck(ctx.getParent().getChild(2).getText())) {
                newVariable.setName(ctx.getPayload().getText());
                newVariable.setType(ctx.getParent().getChild(2).getText());
                newVariable.setArgument(false);
                newVariable.setLocation(new Location(ctx.start.getLine(), ctx.stop.getLine()));
                this.file.getVariables().add(newVariable);
            }
        }
        else if (ctx.getParent().getChildCount() == 1) {
            //this is a standalone function argument
            //pretty sure the parents parent's first child is the name of a named function
        }
    }

    //the children of this are the function keyword, the arguments, and the content of the function
    //if you break it down further you get all of the sub expressions but we dont need those
    static final int functionNameChars = 15;

    @Override
    public void enterAnoymousFunctionDecl(JavaScriptParser.AnoymousFunctionDeclContext ctx) {

        Function newFunction = new Function();
        //if there are six children its an anonymous function declared with the function syntax with
        //no arguments
        //anonymous function with no arguments
        if(ctx.getChildCount() == 6) {
            int length = ctx.children.get(4).getText().length() > functionNameChars ? functionNameChars : ctx.children.get(4).getText().length();
            newFunction.setName("function(){" + ctx.children.get(4).getText().substring(0, length));
            //promise or no promise, TODO
            newFunction.setReturnType("promise");
            newFunction.setIsconstructor(false);
            newFunction.setLocation(new Location(ctx.start.getLine(), ctx.stop.getLine()));
            this.file.getFunctions().add(newFunction);
        }
        else if (ctx.getChildCount() > 6) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < ctx.getChildCount() - 3; i++) {
                sb.append(ctx.children.get(i).getText());
            }
            newFunction.setName(sb.toString());
            //TODO
            newFunction.setReturnType("promise");
            newFunction.setIsconstructor(false);
            newFunction.setLocation(new Location(ctx.start.getLine(), ctx.stop.getLine()));
            this.file.getFunctions().add(newFunction);
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
        //if this involves a callback, this will be treated as a function
        Variable newVariable = new Variable();
        if (ctx.getChildCount() >=3) {
            if (!hasCallabck(ctx.children.get(2).getText())) {
                //in the example object.function() set the name to object and the type to function()
                newVariable.setName(ctx.children.get(0).getText());
                newVariable.setType(ctx.children.get(2).getText());
                newVariable.setLocation(new Location(ctx.start.getLine(), ctx.stop.getLine()));
            }
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
        Function newFunction = new Function();
        for (int i = 0; i < ctx.getChildCount(); i++) {
            for (int j = 0; j < ctx.getChild(i).getChildCount(); j++) {
                if (ctx.children.get(i).getChild(j).getChildCount() >= 3) {
                    Variable newVariable = new Variable();
                    System.out.println(ctx.children.get(i).getChild(j).getChild(0).getText());
                    newVariable.setName(ctx.children.get(i).getChild(j).getChild(0).getText());
                    newVariable.setType(ctx.children.get(i).getChild(j).getChild(2).getText());
                    //TODO
                    newVariable.setLocation(new Location(0,0));
                    newVariable.setArgument(false);
                    file.getVariables().add(newVariable);
                }
            }
        }
        //TODO determine if anonymous or named
        newFunction.setName("");
        newFunction.setIsconstructor(false);
        newFunction.setReturnType("void");
        newFunction.setLocation(new Location(ctx.start.getLine(), ctx.stop.getLine()));
        file.getFunctions().add(newFunction);
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




//debugging prints for arguments
//        else {
////            1, 1, assignments seem to be function args these can be disregarded
//            System.out.println("\nstart assignemnt");
//            System.out.println(ctx.getParent().getParent().getChildCount());
//            System.out.println(ctx.getParent().getChildCount());
//            System.out.println(ctx.getPayload().getText());//this is just the variable name
//            if (ctx.getParent() != null && ctx.getParent().getChildCount() >= 3) {
//                System.out.println(ctx.getParent().getChild(2).getText()); //what its equal to
//                System.out.println(ctx.getParent().getChild(2).getChildCount());
//                if(ctx.getParent().getChild(2).getChild(1) != null) {
//                    int substringLength = ctx.getParent().getChild(2).getChild(1).getText().length() >=9 ? 9: -1;
//                    System.out.println(ctx.getParent().getChild(2).getChild(1).getText());
//                    if(substringLength > 0)
//                        System.out.println(ctx.getParent().getChild(2).getChild(1).getText().substring(1, substringLength));
//                    if (substringLength < 0) {
//                        System.out.println("not a function");
//                    }
//                    else if (ctx.getParent().getChild(2).getChild(1).getText().substring(1, substringLength).equals("function")) {
//                        System.out.println("dropped, its a function");
//                    }
//                }
//            }
//            System.out.println("end assignment\n");
//        }
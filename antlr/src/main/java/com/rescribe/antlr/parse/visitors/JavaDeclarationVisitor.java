package com.rescribe.antlr.parse.visitors;

import com.rescribe.antlr.gen.java.JavaParser;
import com.rescribe.antlr.gen.java.JavaParserBaseVisitor;
import com.rescribe.antlr.parse.results.Results;
import org.antlr.v4.runtime.tree.ParseTree;

import java.util.ArrayList;
import java.util.List;

public class JavaDeclarationVisitor extends JavaParserBaseVisitor {
    public Results tempResults;
    public Results results;
    public int depth, max_depth;
    public JavaDeclarationVisitor() {
        super();
        this.tempResults = new Results();
        this.results = new Results();
        this.max_depth = 7;
        this.depth = 0;
    }

    @Override
    public Results visitMethodDeclaration(JavaParser.MethodDeclarationContext ctx) {
        this.results = new Results();
        int n = ctx.getChildCount();
        if (n > 0) {
            for (int i = 0; i < n; i ++) {
                this.results.addResults(ctx.children.get(i).getText());
            }
        }
        this.results.setLabel(ctx.children.get(1).getText());
        return this.results;
    }

//    @Override
//    public Results visitClassBody(JavaParser.ClassBodyContext ctx) {
//        int n = ctx.getChildCount();
//        if (n > 0) {
//            for (int i = 0; i < n; i++) {
//                this.visitParseTree(ctx.children.get(i));
//                this.depth = 0;
//            }
//        }
//        String r;
//        for (int j = 0; j < this.tempResults.size(); j++) {
//            if ((r = tempResults.get(j)) != null) {
//                results.addResults(r);
//            }
//        }
//        return this.results;
//    }

//    public Results visitClassBodyDeclaration(List<JavaParser.ClassBodyDeclarationContext> ctx) {
//        for (JavaParser.ClassBodyDeclarationContext c : ctx) {
//            results.addResults(c.getClass().toGenericString());
//        }
//        return this.results;
//    }

//    public String visitParseTree(ParseTree ctx) {
//        this.depth++;
//        if (this.depth > max_depth) {
//            return ctx.getText();
//        }
//        int n = ctx.getChildCount();
//        ArrayList<String> al = new ArrayList<>();
//        if (n > 0) {
//            for (int i = 0; i < n; i++){
//                al.add(this.visitParseTree(ctx.getChild(i)));
//            }
//            tempResults.addResults(al);
//            return null;
//        }
//
//        return ctx.getText();
//    }
}

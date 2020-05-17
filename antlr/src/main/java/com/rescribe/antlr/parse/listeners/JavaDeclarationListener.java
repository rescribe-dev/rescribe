package com.rescribe.antlr.parse.listeners;

import static java.lang.Math.abs;

import com.rescribe.antlr.gen.java.JavaLexer;
import com.rescribe.antlr.gen.java.JavaParser;
import com.rescribe.antlr.gen.java.JavaParserBaseListener;
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

public class JavaDeclarationListener extends JavaParserBaseListener implements CustomListener {
  File file;
  BufferedTokenStream tokens;
  Stack<Parent> parents = new Stack<>();

  public JavaDeclarationListener(BufferedTokenStream tokens, FileInput input) {
    super();
    this.tokens = tokens;
    this.file = new File(input);
    parents.push(new Parent(this.file.get_id(), ParentType.File));
  }

  // get comments - reference book 209 - hidden channels

  public File getFileData() {
    return this.file;
  }

  @Override
  public void enterPackageDeclaration(JavaParser.PackageDeclarationContext ctx) {
    if (ctx.getChildCount() >= 3) {
      file.setImportPath(ctx.getChild(1).getText());
    }
  }

  @Override
  public void enterImportDeclaration(JavaParser.ImportDeclarationContext ctx) {
    if (ctx.getChildCount() >= 2) {
      Import newImport = new Import();
      newImport.setParent(parents.peek());
      newImport.setLocation(new Location(ctx.start.getLine(), ctx.stop.getLine()));
      if (ctx.getChildCount() > 3) {
        // import everything
        newImport.setPath(ctx.getChild(1).getText());
        newImport.setSelection(ctx.getChild(3).getText());
      } else {
        String path = ctx.getChild(1).getText();
        int lastDot = path.lastIndexOf('.');
        newImport.setPath(path.substring(0, lastDot));
        newImport.setSelection(path.substring(lastDot + 1));
      }
      file.getImports().add(newImport);
    }
  }

  public List<Comment> getComments(
      ParserRuleContext ctx,
      Location location,
      int levelNumber,
      boolean isBefore,
      boolean isMultiLine) {
    ParserRuleContext currentCtx = ctx;
    List<Comment> comments = new ArrayList<>();
    for (int i = 0; i < abs(levelNumber); i++) {
      currentCtx =
          levelNumber < 0 ? (ParserRuleContext) currentCtx.getChild(0) : currentCtx.getParent();
      if (currentCtx == null) {
        return comments;
      }
    }
    Token token = isBefore ? currentCtx.getStart() : currentCtx.getStop();
    // System.out.println(token.getText());
    int channel = isMultiLine ? JavaLexer.COMMENT : JavaLexer.LINE_COMMENT;
    int tokenIndex = token.getTokenIndex();
    List<Token> commentData =
        isBefore
            ? tokens.getHiddenTokensToLeft(tokenIndex, channel)
            : tokens.getHiddenTokensToRight(tokenIndex, channel);
    if (commentData != null) {
      for (Token commentToken : commentData) {
        if (commentToken != null) {
          String currentComment = commentToken.getText().trim().substring(2).trim();
          if (isMultiLine) {
            currentComment = currentComment.substring(0, currentComment.length() - 2).trim();
          }
          Comment comment =
              new Comment(
                  currentComment,
                  isMultiLine ? CommentType.multilineComment : CommentType.singleLineComment);
          comment.setParent(parents.peek());
          comment.setLocation(location);
          comments.add(comment);
        }
      }
    }
    return comments;
  }

  static final int classLevelNumber = 1;

  @Override
  public void enterClassDeclaration(JavaParser.ClassDeclarationContext ctx) {
    Class newClass = new Class();
    newClass.setParent(this.parents.peek());
    parents.push(new Parent(newClass.get_id(), ParentType.Class));
    newClass.setName(ctx.children.get(1).getText());
    newClass.setLocation(new Location(ctx.start.getLine(), ctx.stop.getLine()));
    file.getComments()
        .addAll(
            getComments(
                ctx,
                new Location(ctx.start.getLine(), ctx.start.getLine()),
                classLevelNumber,
                true,
                false));
    file.getComments()
        .addAll(
            getComments(
                ctx,
                new Location(ctx.start.getLine(), ctx.start.getLine()),
                classLevelNumber,
                true,
                true));
    this.file.getClasses().add(newClass);
  }

  @Override
  public void exitClassDeclaration(JavaParser.ClassDeclarationContext ctx) {
    parents.pop();
  }

  static final int functionLevelNumber = 2;

  private void processFunction(ParserRuleContext ctx, boolean isConstructor) {
    Function newFunction = null;
    if (ctx.getChildCount() >= 4) {
      newFunction = new Function();
      newFunction.setParent(parents.peek());
      parents.push(new Parent(newFunction.get_id(), ParentType.Function));
      newFunction.setLocation(new Location(ctx.start.getLine(), ctx.stop.getLine()));
      final int offset = isConstructor ? 0 : 1;
      if (!isConstructor) {
        newFunction.setReturnType(ctx.getChild(0).getText());
      } else {
        newFunction.setReturnType("void");
      }
      newFunction.setName(ctx.getChild(offset).getText());
      if (ctx.getChild(1 + offset).getChildCount() == 3) {
        ParseTree arguments = ctx.getChild(1 + offset).getChild(1);
        for (int i = 0; i < arguments.getChildCount(); i++) {
          ParseTree currentVariableData = arguments.getChild(i);
          if (currentVariableData.getChildCount() >= 2) {
            Variable currentVariable = new Variable();
            currentVariable.setType(currentVariableData.getChild(0).getText());
            currentVariable.setName(currentVariableData.getChild(1).getText());
            currentVariable.setLocation(new Location(ctx.start.getLine(), ctx.start.getLine()));
            currentVariable.setParent(parents.peek());
            currentVariable.setArgument(true);
          }
        }
      }
      newFunction.setIsconstructor(isConstructor);
      file.getComments()
          .addAll(
              getComments(
                  ctx,
                  new Location(ctx.start.getLine(), ctx.start.getLine()),
                  functionLevelNumber,
                  true,
                  false));
      file.getComments()
          .addAll(
              getComments(
                  ctx,
                  new Location(ctx.start.getLine(), ctx.start.getLine()),
                  functionLevelNumber,
                  true,
                  true));
    }
    this.file.getFunctions().add(newFunction);
  }

  @Override
  public void enterConstructorDeclaration(JavaParser.ConstructorDeclarationContext ctx) {
    processFunction(ctx, true);
  }

  @Override
  public void exitConstructorDeclaration(JavaParser.ConstructorDeclarationContext ctx) {
    this.parents.pop();
  }

  @Override
  public void enterMethodDeclaration(JavaParser.MethodDeclarationContext ctx) {
    processFunction(ctx, false);
  }

  @Override
  public void exitMethodDeclaration(JavaParser.MethodDeclarationContext ctx) {
    this.parents.pop();
  }

  @Override
  public void enterVariableDeclarator(JavaParser.VariableDeclaratorContext ctx) {
    Variable newVariable = new Variable();
    newVariable.setParent(this.parents.peek());
    parents.push(new Parent(newVariable.get_id(), ParentType.Variable));
    newVariable.setName(ctx.getChild(0).getText());
    newVariable.setType(ctx.getParent().getParent().getChild(0).getText());
    newVariable.setLocation(new Location(ctx.start.getLine(), ctx.stop.getLine()));
    newVariable.setArgument(false);
    this.file.getVariables().add(newVariable);
  }

  static final int variableLevelNumber = 3;

  @Override
  public void exitVariableDeclarator(JavaParser.VariableDeclaratorContext ctx) {
    file.getComments()
        .addAll(
            getComments(
                ctx,
                new Location(ctx.start.getLine(), ctx.stop.getLine()),
                variableLevelNumber,
                true,
                false));
    file.getComments()
        .addAll(
            getComments(
                ctx,
                new Location(ctx.start.getLine(), ctx.stop.getLine()),
                variableLevelNumber,
                true,
                true));
    this.parents.pop();
  }
}

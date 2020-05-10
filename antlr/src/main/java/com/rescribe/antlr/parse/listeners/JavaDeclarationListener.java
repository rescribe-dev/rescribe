package com.rescribe.antlr.parse.listeners;

import static java.lang.Math.abs;

import com.rescribe.antlr.gen.java.JavaLexer;
import com.rescribe.antlr.gen.java.JavaParser;
import com.rescribe.antlr.gen.java.JavaParserBaseListener;
import com.rescribe.antlr.parse.CustomListener;
import com.rescribe.antlr.parse.schema.*;
import com.rescribe.antlr.parse.schema.Class;
import java.util.ArrayList;
import java.util.List;
import org.antlr.v4.runtime.BufferedTokenStream;
import org.antlr.v4.runtime.ParserRuleContext;
import org.antlr.v4.runtime.Token;
import org.antlr.v4.runtime.tree.ParseTree;

public class JavaDeclarationListener extends JavaParserBaseListener implements CustomListener {
  File file;

  BufferedTokenStream tokens;
  Function currentFunction = null;
  Class currentClass = null;
  Variable currentVariable = null;

  public JavaDeclarationListener(BufferedTokenStream tokens, String filename, String path) {
    super();
    this.tokens = tokens;
    this.file = new File(filename, path);
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

  @Override
  public void enterClassDeclaration(JavaParser.ClassDeclarationContext ctx) {
    Class newClass = new Class();
    newClass.setName(ctx.children.get(1).getText());
    newClass.setLocation(new Location(ctx.start.getLine(), ctx.stop.getLine()));
    this.currentClass = newClass;
    this.file.getClasses().add(this.currentClass);
  }

  @Override
  public void exitClassDeclaration(JavaParser.ClassDeclarationContext ctx) {
    // process class output
    this.currentClass = null;
  }

  private List<Comment> getComments(
      ParserRuleContext ctx, int levelNumber, boolean isBefore, boolean isMultiLine) {
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
          comments.add(
              new Comment(
                  currentComment,
                  isMultiLine ? CommentType.multilineComment : CommentType.singleLineComment));
        }
      }
    }
    return comments;
  }

  static final int functionLevelNumber = 2;

  private Function processFunction(ParserRuleContext ctx, boolean isConstructor) {
    Function newFunction = null;
    if (ctx.getChildCount() >= 4) {
      newFunction = new Function();
      newFunction.setLocation(new Location(ctx.start.getLine(), ctx.stop.getLine()));
      final int offset = isConstructor ? 0 : 1;
      if (!isConstructor) {
        newFunction.setReturnType(ctx.getChild(0).getText());
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
            newFunction.getArguments().add(currentVariable);
          }
        }
      }
      newFunction.setContents(ctx.getChild(ctx.getChildCount() - 1).getText());
      newFunction.getComments().addAll(getComments(ctx, functionLevelNumber, true, false));
      newFunction.getComments().addAll(getComments(ctx, functionLevelNumber, true, true));
    }
    return newFunction;
  }

  @Override
  public void enterConstructorDeclaration(JavaParser.ConstructorDeclarationContext ctx) {
    if (this.currentClass != null) {
      Function newConstructor = processFunction(ctx, true);
      this.currentClass.setConstructor(newConstructor);
      this.currentFunction = newConstructor;
    }
  }

  @Override
  public void exitConstructorDeclaration(JavaParser.ConstructorDeclarationContext ctx) {
    this.currentFunction = null;
  }

  @Override
  public void enterMethodDeclaration(JavaParser.MethodDeclarationContext ctx) {
    Function newFunction = processFunction(ctx, false);
    if (this.currentClass != null) {
      this.file.getClasses().get(this.file.getClasses().size() - 1).getFunctions().add(newFunction);
    } else {
      this.file.getFunctions().add(newFunction);
    }
    this.currentFunction = newFunction;
  }

  @Override
  public void exitMethodDeclaration(JavaParser.MethodDeclarationContext ctx) {
    this.currentFunction = null;
  }

  @Override
  public void enterGenericMethodDeclaration(JavaParser.GenericMethodDeclarationContext ctx) {
    // process generic function
    this.currentFunction = new Function();
  }

  @Override
  public void exitGenericConstructorDeclaration(
      JavaParser.GenericConstructorDeclarationContext ctx) {
    this.currentFunction = null;
  }

  @Override
  public void enterVariableDeclarator(JavaParser.VariableDeclaratorContext ctx) {
    Variable newVariable = new Variable();
    newVariable.setName(ctx.getChild(0).getText());
    newVariable.setType(ctx.getParent().getParent().getChild(0).getText());
    newVariable.setLocation(new Location(ctx.start.getLine(), ctx.stop.getLine()));
    if (this.currentFunction != null) {
      this.currentFunction.getVariables().add(newVariable);
    } else if (this.currentClass != null) {
      this.currentClass.getVariables().add(newVariable);
    } else {
      this.file.getVariables().add(newVariable);
    }
    this.currentVariable = newVariable;
  }

  static final int variableLevelNumber = 3;

  @Override
  public void exitVariableDeclarator(JavaParser.VariableDeclaratorContext ctx) {
    if (currentVariable != null) {
      currentVariable.getComments().addAll(getComments(ctx, variableLevelNumber, true, false));
      currentVariable.getComments().addAll(getComments(ctx, variableLevelNumber, true, true));
    }
    this.currentVariable = null;
  }
}

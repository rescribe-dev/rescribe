package com.rescribe.antlr.parse.listeners;

import com.rescribe.antlr.gen.java.JavaParser;
import com.rescribe.antlr.gen.java.JavaParserBaseListener;
import com.rescribe.antlr.parse.CustomListener;
import com.rescribe.antlr.parse.schema.*;
import com.rescribe.antlr.parse.schema.Class;
import lombok.Getter;
import org.antlr.v4.runtime.tree.ParseTree;

public class JavaDeclarationListener extends JavaParserBaseListener implements CustomListener {
  File file;
  @Getter String filename;

  Function currentFunction = null;
  Class currentClass = null;
  Variable currentVariable = null;

  public JavaDeclarationListener(String filename) {
    super();
    this.file = new File(filename);
  }

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
    this.currentClass = newClass;
    this.file.getClasses().add(this.currentClass);
  }

  @Override
  public void exitClassDeclaration(JavaParser.ClassDeclarationContext ctx) {
    // process class output
    this.currentClass = null;
  }

  private Function processFunction(ParseTree ctx, boolean isConstructor) {
    Function currentFunction = new Function();
    if (ctx.getChildCount() >= 4) {
      final int offset = isConstructor ? 0 : 1;
      if (!isConstructor) {
        currentFunction.setReturnType(ctx.getChild(0).getText());
      }
      currentFunction.setName(ctx.getChild(offset).getText());
      if (ctx.getChild(1 + offset).getChildCount() == 3) {
        ParseTree arguments = ctx.getChild(1 + offset).getChild(1);
        for (int i = 0; i < arguments.getChildCount(); i++) {
          ParseTree currentVariableData = arguments.getChild(i);
          if (currentVariableData.getChildCount() >= 2) {
            Variable currentVariable = new Variable();
            currentVariable.setType(currentVariableData.getChild(0).getText());
            currentVariable.setName(currentVariableData.getChild(1).getText());
            currentFunction.getArguments().add(currentVariable);
          }
        }
      }
      currentFunction.setContents(ctx.getChild(ctx.getChildCount() - 1).getText());
    }
    return currentFunction;
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
    if (this.currentFunction != null) {
      this.currentFunction.getVariables().add(newVariable);
    } else if (this.currentClass != null) {
      this.currentClass.getVariables().add(newVariable);
    } else {
      this.file.getVariables().add(newVariable);
    }
    this.currentVariable = newVariable;
  }

  @Override
  public void exitVariableDeclarator(JavaParser.VariableDeclaratorContext ctx) {
    this.currentVariable = null;
  }

  //          results.add(
  //                  visitor.visitClassBodyDeclaration(ctx.classBody().classBodyDeclaration())
  //          );

  //      for (JavaParser.ClassBodyDeclarationContext i : ctx.classBody().classBodyDeclaration()) {
  //        JavaResults.add(visitor.visitClassBodyDeclaration(i));
  //      }
  //      this.current_classname =
  // ctx.classBody().classBodyDeclaration(2).memberDeclaration().children.get(0).getChild(1).getText();
  //      results.add(
  //              new Results(current_classname, "class")
  //      );
  //      String full = ctx.classBody().classBodyDeclaration(2).memberDeclaration().getText();
  //      results.add(
  //              new Results(full, "this is the output of full")
  //      );
  //      full = ctx.classBody().classBodyDeclaration(10).memberDeclaration().getText();
  //      results.add(
  //              new Results(full, "this is the output of full")
  //      );

  //  @Override
  //  public void enterClassDeclaration(JavaParser.ClassDeclarationContext ctx) {
  //    if (ctx.children == null) {
  //      return;
  //    }
  //    results.add(
  //            new Results(ctx.classBody().children.get(5).getClass().getSimpleName(), "class")
  //    );
  //    if (ctx.classBody() != null) {
  //      results.add(
  //              visitor.visitClassBody(ctx.classBody())
  //      );
  //    }
  //
  ////    for (int i = 0; i < ctx.classBody().children.size(); i++) {
  ////      results.add(
  ////              new Results(ctx.classBody().children.get(i).getText(), "class")
  ////      );
  ////    }
  //
  //  }
  //
  //  @Override
  //  public void enterMethodDeclaration(JavaParser.MethodDeclarationContext ctx) {
  //    if (ctx.children == null) {
  //      return;
  //    }
  //
  //    results.add(
  //            new Results(ctx.getText(), "function")
  //    );
  //
  //  }
  //
  //  //this will return the name of the variable: its parent will be the type and the name with no
  // spaces ex: intx;
  //  @Override
  //  public void enterVariableDeclarators(JavaParser.VariableDeclaratorsContext ctx) {
  //    if (ctx.children == null) {
  //      return;
  //    }
  //
  ////    results.add(
  ////            new Results(ctx.getText(), "variable")
  ////    );
  //  }
  //
  //  //this will also return the name of the variable
  //  @Override
  //  public void enterVariableDeclarator(JavaParser.VariableDeclaratorContext ctx) {
  //    if (ctx.children == null) {
  //      return;
  //    }
  //
  ////    results.add(
  ////            new Results(ctx.parent.getText(), "variable")
  ////    );
  //  }
  //
  //  //this will capture what every variable is initialized to. Ex; if int x = 0; this outputs 0,
  // if ArrayList ar = new ArrayList<>(); this outputs newArrayList<>()
  //  //the parent is the variable name. so in the above case, parent.getText() returns x=0
  //  @Override
  //  public void enterVariableInitializer(JavaParser.VariableInitializerContext ctx) {
  //    if (ctx.children == null) {
  //      return;
  //    }
  //
  //    results.add(
  //            new Results(ctx.parent.getText(), "variable")
  //    );
  //  }
  //
  //  @Override
  //  public void enterMethodCall(JavaParser.MethodCallContext ctx) {
  //    super.enterMethodCall(ctx);
  //  }
}

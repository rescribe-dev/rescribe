package com.rescribe.antlr.parse.listeners;

import com.rescribe.antlr.gen.java.JavaParser;
import com.rescribe.antlr.gen.java.JavaParserBaseListener;
import com.rescribe.antlr.parse.CustomListener;
import com.rescribe.antlr.parse.schema.*;
import com.rescribe.antlr.parse.schema.Class;
import com.rescribe.antlr.parse.visitors.JavaDeclarationVisitor;
import lombok.Getter;

public class JavaDeclarationListener extends JavaParserBaseListener implements CustomListener {
  File file;
  @Getter String filename;

  boolean in_class;

  JavaDeclarationVisitor visitor;

  public JavaDeclarationListener(String filename) {
    super();
    this.file = new File(filename);
    this.visitor = new JavaDeclarationVisitor();
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
    this.in_class = true;
    Class newClass = new Class();
    newClass.setName(ctx.children.get(1).getText());
    this.file.getClasses().add(newClass);
  }

  @Override
  public void enterMethodDeclaration(JavaParser.MethodDeclarationContext ctx) {
    Function currentFunction = this.visitor.visitMethodDeclaration(ctx);

    if (in_class) {
      this.file
          .getClasses()
          .get(this.file.getClasses().size() - 1)
          .getFunctions()
          .add(currentFunction);
    }
  }

  @Override
  public void exitClassDeclaration(JavaParser.ClassDeclarationContext ctx) {
    // process class output
  }

  @Override
  public void enterGenericMethodDeclaration(JavaParser.GenericMethodDeclarationContext ctx) {
    // process generic function
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

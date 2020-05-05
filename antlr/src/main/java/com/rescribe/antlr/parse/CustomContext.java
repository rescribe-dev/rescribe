package com.rescribe.antlr.parse;

import com.rescribe.antlr.gen.cpp.CPP14Parser;
import com.rescribe.antlr.gen.java.JavaParser;
import com.rescribe.antlr.gen.python3.Python3Parser;
import javassist.compiler.ast.Variable;
import org.antlr.v4.runtime.ParserRuleContext;

public class CustomContext {
   public  enum CONTEXT_TYPE {
        JAVA,
        PYTHON,
        CPP
    }

    public CONTEXT_TYPE context_type;

    private ParserRuleContext class_ctx, method_ctx, variable_ctx;

    public CustomContext(ParserRuleContext class_ctx, ParserRuleContext method_ctx, ParserRuleContext variable_ctx, String type) {

        switch (type){
            case "java":
                this.context_type = CONTEXT_TYPE.JAVA;
                break;
            case "python":
                this.context_type = CONTEXT_TYPE.PYTHON;
                break;
            case "cpp":
                this.context_type = CONTEXT_TYPE.CPP;
                break;
            default:
                throw new IllegalStateException("Unexpected value: " + type + " Expected: \"java\", \"python\", or \"cpp\"\n");
        }
        this.class_ctx = class_ctx;
        this.method_ctx = method_ctx;
        this.variable_ctx = variable_ctx;
    }

    public ParserRuleContext getClassContext() {

    }
}






//    private JavaParser.ClassDeclarationContext java_class_ctx;
//    private JavaParser.MethodDeclarationContext java_method_ctx;
//    private JavaParser.VariableDeclaratorContext java_variable_ctx;
//
//    private Python3Parser.ClassdefContext python_class_ctx;
//    private Python3Parser.FuncdefContext python_method_ctx;
//
//    private CPP14Parser.ClassnameContext cpp_class_ctx;
//    private CPP14Parser.FunctiondefinitionContext cpp_method_ctx;

//overloaded constructors to handle the different types of context
//    public CustomContext(JavaParser.ClassDeclarationContext ctx, JavaParser.MethodDeclarationContext mctx, JavaParser.VariableDeclaratorContext vctx){
//        this.java_class_ctx = ctx;
//        this.java_method_ctx = mctx;
//        this.java_variable_ctx = vctx;
//        this.context_type = CONTEXT_TYPE.JAVA;
//    }
//
//    public CustomContext(Python3Parser.ClassdefContext ctx, Python3Parser.FuncdefContext mctx) {
//        this.python_class_ctx = ctx;
//        this.python_method_ctx = mctx;
//        this.context_type = CONTEXT_TYPE.PYTHON;
//    }
//
//    public CustomContext(CPP14Parser.ClassnameContext ctx, CPP14Parser.FunctiondefinitionContext mctx) {
//        this.cpp_class_ctx = ctx;
//        this.cpp_method_ctx = mctx;
//        this.context_type = CONTEXT_TYPE.CPP;
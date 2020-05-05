package com.rescribe.antlr.parse.results;
import java.security.InvalidParameterException;
import java.util.ArrayList;
import lombok.Getter;
import lombok.Setter;

public class Results {
    enum Results_Type {
        CLASS,
        FUNCTION,
        VARIABLE,
        BEAN
    }
    @Getter
    ArrayList<String> results;
    Results_Type results_type;
    public Results(String input, String type) {
        switch(type) {
            case "class":
                results_type = Results_Type.CLASS;
                break;
            case "function":
                results_type = Results_Type.FUNCTION;
                break;
            case "variable":
                results_type = Results_Type.VARIABLE;
                break;
            default:
                results_type = Results_Type.BEAN;
                break;
        }
        results = new ArrayList<>();
        results.add(input);

    }
    public String getResultsType() {
        switch (this.results_type) {
            case CLASS:
                return "class";
            case FUNCTION:
                return "function";
            case VARIABLE:
                return "variable";
            case BEAN:
                return "bean";
            default:
                throw new InvalidParameterException();
        }

    }
    public Results() { this("", ""); }

    public String toString() {
        StringBuilder sb = new StringBuilder();


        if (this.results != null){
            for (String s : this.results) {
                sb.append(s);
            }
            return sb.toString();
        }
        throw new InvalidParameterException();
    }
}

//BASE FOR DIFFERENT FUNCTION IMPLEMENTATIONS BASED OFF OF THE RESULTS_TYPE
//THIS ONE IS FOR toString()
//        ArrayList<String> al = this.results;
//        switch (this.results_type) {
//            case CLASS:
//                al = this.class_results;
//                break;
//            case FUNCTION:
//                al = this.function_results;
//                break;
////            case VARIABLE:
////                al = this.variable_results;
////            break;
//            case BEAN:
//                return "";
//        }
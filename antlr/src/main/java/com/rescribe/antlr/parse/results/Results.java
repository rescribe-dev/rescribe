package com.rescribe.antlr.parse.results;
import java.security.InvalidParameterException;
import java.util.ArrayList;
import lombok.Getter;
import lombok.Setter;

public class Results {
    enum Results_Type {
        CLASS,
        CLASS_METHOD,
        FUNCTION,
        VARIABLE,
        CUSTOM
    }
    @Getter
    ArrayList<String> results;
    Results_Type results_type;
    String label;
    @Getter
    @Setter
    String parent;
    public Results(String input, String type) {
        label = "custom";
        switch(type) {
            case "class":
                results_type = Results_Type.CLASS;
                break;
            case "class method":
                results_type = Results_Type.CLASS_METHOD;
                break;
            case "function":
                results_type = Results_Type.FUNCTION;
                break;
            case "variable":
                results_type = Results_Type.VARIABLE;
                break;
            default:
                results_type = Results_Type.CUSTOM;
                label = type;
                break;
        }
        results = new ArrayList<>();
        results.add(input);

    }
    public void setResultsType(String input) {
        switch(input) {
            case "class":
                results_type = Results_Type.CLASS;
                break;
            case "class method":
                results_type = Results_Type.CLASS_METHOD;
                break;
            case "function":
                results_type = Results_Type.FUNCTION;
                break;
            case "variable":
                results_type = Results_Type.VARIABLE;
                break;
            default:
                results_type = Results_Type.CUSTOM;
                break;
        }
    }
    public void setLabel(String input) {
        this.label = input;
    }
    public String getLabel() {
        return this.label;
    }
    public String get(int i) {
        return this.results.get(i);
        
    }
    public int size() {
        return this.results.size();
    }

    public void addResults(String input) {
        results.add(input);
        return;
    }
    public void addResults(ArrayList<String> input) {
        for (String s : input) {
            results.add(s);
        }
        return;
    }
    public String getResultsType() {
        switch (this.results_type) {
            case CLASS:
                return "class";
            case CLASS_METHOD:
                return "class method";
            case FUNCTION:
                return "function";
            case VARIABLE:
                return "variable";
            case CUSTOM:
                return this.label;
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
//            case CUSTOM:
//                return "";
//        }
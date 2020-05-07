package com.rescribe.antlr.parse.results;
import java.security.InvalidParameterException;
import java.util.ArrayList;
import lombok.Getter;
import lombok.Setter;

public class Results {
    public enum ResultsType {
        CLASS,
        CLASS_METHOD,
        FUNCTION,
        VARIABLE,
        CUSTOM
    }



    @Getter @Setter String parent;
    @Getter @Setter String label;
    @Getter @Setter ResultsType results_type;
    @Getter @Setter ArrayList<String> results;

    public Results() {
        this("", "");
    }

    public Results(String input, String type) {
        label = "custom";
        switch(type) {
            case "class":
                results_type = ResultsType.CLASS;
                break;
            case "class method":
                results_type = ResultsType.CLASS_METHOD;
                break;
            case "function":
                results_type = ResultsType.FUNCTION;
                break;
            case "variable":
                results_type = ResultsType.VARIABLE;
                break;
            default:
                results_type = ResultsType.CUSTOM;
                label = type;
                break;
        }
        results = new ArrayList<>();
        results.add(input);
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

    public void setResultsType(String input) {
        switch(input) {
            case "class":
                results_type = ResultsType.CLASS;
                break;
            case "class method":
                results_type = ResultsType.CLASS_METHOD;
                break;
            case "function":
                results_type = ResultsType.FUNCTION;
                break;
            case "variable":
                results_type = ResultsType.VARIABLE;
                break;
            default:
                results_type = ResultsType.CUSTOM;
                break;
        }
    }

    public String getLabel() {
        return this.label;
    }
    public void setLabel(String input) {
        this.label = input;
    }
    public int size() {
        return this.results.size();
    }

    public String get(int i) {
        return this.results.get(i);
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
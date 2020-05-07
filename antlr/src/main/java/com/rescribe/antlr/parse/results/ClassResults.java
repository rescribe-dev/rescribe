package com.rescribe.antlr.parse.results;
import lombok.Getter;
import lombok.Setter;
import java.util.List;
import java.util.ArrayList;

public class ClassResults extends Results {

    @Getter @Setter String class_body;
    @Getter @Setter Results constructor;
    @Getter @Setter List<Results> class_methods;
    @Getter @Setter List<Results> class_variables;

    public ClassResults() {
        this(new String(), new Results(), new ArrayList<>(), new ArrayList<>(), "default");
    }

    public ClassResults(String class_body, Results constructor, List<Results> class_methods, List<Results> class_variables, String label) {
        this.class_body = class_body;
        this.constructor = constructor;
        this.class_methods = class_methods;
        this.class_variables = class_variables;
        this.results_type = ResultsType.CLASS;
        this.label = label;
    }
}

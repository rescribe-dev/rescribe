package com.rescribe.antlr.parse;

import javax.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NonNull;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
public class ClassDefinitionOutput {
    @NonNull private String type, name, content, location, description;
//    private ConstructorDefinitionOutput cdo;
//    private List<FunctionDefinitionOutput> fdo;
//    private List<VariableDefinitionOutput> vdo;
    @NonNull private Integer startIndex, endIndex;
}
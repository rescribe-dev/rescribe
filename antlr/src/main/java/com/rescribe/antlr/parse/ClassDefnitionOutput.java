package com.rescribe.antlr.parse;

import javax.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NonNull;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
public class ClassDefnitionOutput {
    @NonNull private String name, content;
    private List<FunctionDefinitionOutput> fdo;
    private List<VariableDefinitionOutput> vdo;
    @NonNull private Integer startIndex, endIndex;
}

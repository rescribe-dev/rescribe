package com.rescribe.antlr.parse;

import javax.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NonNull;
import java.util.List;

@Entity
@Data
@AllArgsConstructor

public class ConstructorDefinitionOutput {
    @NonNull protected List<VariableDefinitionOutput> vdo;
    @NonNull protected String name, arguments, contents;
    @NonNull protected Integer startIndex, endIndex;
}

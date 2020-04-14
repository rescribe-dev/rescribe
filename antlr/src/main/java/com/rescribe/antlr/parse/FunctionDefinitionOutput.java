package com.rescribe.antlr.parse;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NonNull;

import javax.persistence.Entity;

@Entity
@Data
@AllArgsConstructor
public class FunctionDefinitionOutput {
    @NonNull private String name, content;
    private String returnType;
    @NonNull private Integer startIndex, endIndex;
}

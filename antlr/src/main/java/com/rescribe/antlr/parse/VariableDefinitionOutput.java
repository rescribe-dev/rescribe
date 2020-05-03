package com.rescribe.antlr.parse;

import javax.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NonNull;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
public class VariableDefinitionOutput {
    @NonNull protected String name, type; //TODO parentType parentID

    public String toString() {
        return "Name: "+name+"\nType: "+type+"\n";
    }
}

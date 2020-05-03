package com.rescribe.antlr.parse;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NonNull;

import javax.persistence.Entity;

@Entity
@Data

public class BaselineFunctionDefinitionOutput {
    @NonNull protected String name, arguments, returnType, content;
    @NonNull protected Integer startIndex, endIndex;

    public BaselineFunctionDefinitionOutput(String name, String arguments, String returnType, String content, Integer startIndex, Integer endIndex){
        this.name = name;
        this.arguments = arguments;
        this.returnType = returnType;
        this.content = content;
        this.startIndex = startIndex;
        this.endIndex = endIndex;
    }

    public BaselineFunctionDefinitionOutput() {  }

    public String toString() {
        return "Name: "+name+"\nArguments: "+arguments+"\nContent: "+content+"\nReturnType: "+returnType+"\nStartIndex: "+startIndex+"\nEndIndex: "+endIndex+"\n";
    }
}



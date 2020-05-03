package com.rescribe.antlr.parse;

import javax.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NonNull;

@Entity
@Data
@AllArgsConstructor
public class FunctionDefinitionOutput {
  @NonNull private String name, content;
  private String returnType;
  @NonNull private Integer startIndex, endIndex;

  public String toString() {
    return "Name: "+name+"\nContent: "+content+"\nReturnType: "+returnType+"\nStartIndex: "+startIndex+"\nEndIndex: "+endIndex+"\n";
  }
}

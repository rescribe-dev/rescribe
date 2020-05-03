package com.rescribe.antlr.parse;

import javax.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NonNull;

@Entity
@Data

public class FunctionDefinitionOutput extends BaselineFunctionDefinitionOutput{
  //TODO parent type
  //TODO parent ID
//  @NonNull private String name, content;
//  private String returnType;
//  @NonNull private Integer startIndex, endIndex;

  public FunctionDefinitionOutput(String name, String arguments, String returnType, String content, Integer startIndex, Integer endIndex){
    super(name, arguments, returnType, content, startIndex, endIndex);
  }
  public FunctionDefinitionOutput(){
    super();
  }
//  public String toString() {
//    return "Name: "+super.name+"\nContent: "+content+"\nReturnType: "+returnType+"\nStartIndex: "+startIndex+"\nEndIndex: "+endIndex+"\n";
//
//  }
}

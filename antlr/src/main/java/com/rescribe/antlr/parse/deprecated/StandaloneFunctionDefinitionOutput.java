package com.rescribe.antlr.parse;

import javax.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NonNull;
import java.util.List;

@Entity
@Data

public class StandaloneFunctionDefinitionOutput extends BaselineFunctionDefinitionOutput{
    //TODO parent type
    //TODO parent ID
    public StandaloneFunctionDefinitionOutput(String name, String arguments, String returnType, String content, Integer startIndex, Integer endIndex){
        super(name, arguments, returnType, content, startIndex, endIndex);
    }
    public StandaloneFunctionDefinitionOutput() {
        super();
    }
//    public StandaloneFunctionDefinitionOutput(){ super(); }

}

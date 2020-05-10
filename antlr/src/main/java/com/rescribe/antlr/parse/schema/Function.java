package com.rescribe.antlr.parse.schema;

import java.util.ArrayList;
import java.util.List;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Function {
  @Getter @Setter String name;
  @Getter @Setter List<Variable> arguments = new ArrayList<>();
  @Getter @Setter String returnType;
  @Getter @Setter String contents;
  @Getter @Setter List<Variable> variables = new ArrayList<>();
}

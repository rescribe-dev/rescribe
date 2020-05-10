package com.rescribe.antlr.parse.schema;

import java.util.ArrayList;
import java.util.List;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Class {
  @Getter @Setter String name;
  @Getter @Setter List<Variable> variables = new ArrayList<>();
  @Getter @Setter Function constructor;
  @Getter @Setter List<Function> functions = new ArrayList<>();
}

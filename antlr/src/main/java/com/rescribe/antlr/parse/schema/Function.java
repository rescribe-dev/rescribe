package com.rescribe.antlr.parse.schema;

import java.util.ArrayList;
import java.util.List;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Function {
  String name;
  List<Variable> arguments = new ArrayList<>();
  String returnType;
  String contents;
  List<Variable> variables = new ArrayList<>();
  Location location;
}

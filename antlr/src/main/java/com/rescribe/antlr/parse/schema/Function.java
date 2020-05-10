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
  // String content;
  List<Variable> variables = new ArrayList<>();
  List<Comment> comments = new ArrayList<>();
  Location location;
}

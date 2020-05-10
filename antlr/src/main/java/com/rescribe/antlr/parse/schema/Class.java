package com.rescribe.antlr.parse.schema;

import java.util.ArrayList;
import java.util.List;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Class {
  String name;
  List<Variable> variables = new ArrayList<>();
  Function constructor;
  List<Function> functions = new ArrayList<>();
  Location location;
}

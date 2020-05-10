package com.rescribe.antlr.parse.schema;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Variable {
  String name;
  String type;
  Location location;
}

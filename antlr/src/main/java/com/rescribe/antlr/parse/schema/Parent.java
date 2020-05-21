package com.rescribe.antlr.parse.schema;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class Parent {
  String _id;
  ParentType type;
}

package com.rescribe.antlr.parse.schema;

import lombok.*;
import lombok.experimental.SuperBuilder;

@AllArgsConstructor
@NoArgsConstructor
@Data
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class Function extends NestedObject {
  String name;
  String returnType;
  boolean isconstructor;
  // String content;
}

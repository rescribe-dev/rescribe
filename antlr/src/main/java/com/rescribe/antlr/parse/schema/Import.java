package com.rescribe.antlr.parse.schema;

import lombok.*;
import lombok.experimental.SuperBuilder;

@AllArgsConstructor
@NoArgsConstructor
@Data
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class Import extends NestedObject {
  String path;
  String selection;
}

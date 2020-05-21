package com.rescribe.antlr.parse.schema;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Import {
  String path;
  String selection;
  Location location;
}

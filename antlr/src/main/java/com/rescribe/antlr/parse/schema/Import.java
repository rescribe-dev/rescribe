package com.rescribe.antlr.parse.schema;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Import {
  @Getter @Setter String path;
  @Getter @Setter String selection;
}

package com.rescribe.antlr.parse.schema;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Variable {
  @Getter @Setter String name;
  @Getter @Setter String type;
}

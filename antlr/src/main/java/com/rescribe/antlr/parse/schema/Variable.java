package com.rescribe.antlr.parse.schema;

import java.util.ArrayList;
import java.util.List;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Variable {
  String name;
  String type;
  Location location;
  List<Comment> comments = new ArrayList<>();
}

package com.rescribe.antlr.parse.schema;

import java.util.ArrayList;
import java.util.List;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class File {
  @Getter @Setter String name;
  @Getter @Setter List<Class> classes = new ArrayList<>();
  @Getter @Setter List<Function> functions = new ArrayList<>();
  @Getter @Setter List<Variable> variables = new ArrayList<>();
  @Getter @Setter List<Import> imports = new ArrayList<>();
  @Getter @Setter String importPath;

  public File(String name) {
    this.name = name;
  }
}

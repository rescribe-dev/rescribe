package com.rescribe.antlr.parse.schema;

import com.rescribe.antlr.parse.FileInput;
import java.util.ArrayList;
import java.util.List;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class File {
  String name;
  List<Class> classes = new ArrayList<>();
  List<Function> functions = new ArrayList<>();
  List<Variable> variables = new ArrayList<>();
  List<Import> imports = new ArrayList<>();
  List<Comment> comments = new ArrayList<>();
  String importPath;
  String path;

  public File(FileInput input) {
    this.name = input.getFileName();
    this.path = input.getPath();
  }
}

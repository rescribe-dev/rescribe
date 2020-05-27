package com.rescribe.antlr.parse.schema;

import com.rescribe.antlr.parse.FileInput;
import java.util.ArrayList;
import java.util.List;
import lombok.*;

@AllArgsConstructor
@Data
public class File {
  final String _id;
  String name;
  String importPath;
  String path;
  List<Class> classes = new ArrayList<>();
  List<Function> functions = new ArrayList<>();
  List<Variable> variables = new ArrayList<>();
  List<Import> imports = new ArrayList<>();
  List<Comment> comments = new ArrayList<>();
  LanguageType language = LanguageType.DEFAULT;

  public File(FileInput input) {
    this._id = input.getId();
    this.name = input.getFileName();
    this.path = input.getPath();
  }
}

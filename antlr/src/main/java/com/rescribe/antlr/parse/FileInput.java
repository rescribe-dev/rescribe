package com.rescribe.antlr.parse;

import javax.persistence.Entity;
import javax.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;

@Entity
@AllArgsConstructor
@Data
public class FileInput {
  @NotEmpty(message = "path must be provided")
  private final String path;

  @NotEmpty(message = "file name must be given")
  private final String fileName;

  @NotEmpty(message = "file content must be given")
  private final String content;
}

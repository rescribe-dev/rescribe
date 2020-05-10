package com.rescribe.antlr.parse.exceptions;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class UnsupportedFileException extends RuntimeException {
  @Getter private final String fileExtension;

  public UnsupportedFileException(String fileExtension) {
    super("Unsupported File Extension in file " + fileExtension);
    this.fileExtension = fileExtension;
  }
}

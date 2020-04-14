package com.rescribe.antlr.parse;

import lombok.Data;

import javax.persistence.Entity;
import javax.validation.constraints.NotEmpty;

@Entity
@Data
public class FileInput {
    @NotEmpty(message = "file name must be given")
    private final String name;
    @NotEmpty(message = "file contents must be given")
    private final String contents;

    FileInput(String name, String contents) {
        this.name = name;
        this.contents = contents;
    }
}

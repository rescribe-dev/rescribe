package com.rescribe.antlr.parse;

import static com.rescribe.antlr.parse.FileHandler.getFileData;

import java.io.BufferedReader;
import java.io.FileReader;

public class RawFileLanguageHandler {

  public static IllegalArgumentException illegal_argument_exception;

  public static void main(String[] args) throws Exception {
    if (args.length == 0) {
      System.out.println("Wrong number of arguments. This takes one or more filepaths\n");
      throw illegal_argument_exception;
    }

    for (String path : args) {
      Reader reader = new Reader(path);
      String file_contents = reader.readFile();
      String file_extension = reader.getFileExtension();
      getFileData(new FileInput(file_extension, file_contents));
    }
  }

  private static class Reader {
    private final String path;
    private final BufferedReader br;

    public Reader(String p) throws Exception {
      this.path = p;
      FileReader fr = new FileReader(path);
      br = new BufferedReader(fr);
    }

    public String readFile() throws Exception {
      StringBuilder sb = new StringBuilder();
      String contents;
      while ((contents = this.br.readLine()) != null) {
        sb.append(contents).append('\n');
      }
      return sb.toString();
    }

    public String getFileExtension() {
      String extension = "";
      int i = path.lastIndexOf('.');
      int p = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
      if (i > p) {
        extension = path.substring(i + 1);
      }
      return extension.replaceAll("\\s", "");
    }
  }
}

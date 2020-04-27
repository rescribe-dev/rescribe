package com.rescribe.antlr;

import java.io.*;
import java.io.BufferedReader;
import java.io.FileReader;
import java.nio.file.Path;
import java.nio.file.Paths;

public class RequestGenerator {
  public void makeRequest(String server, String[] input) throws IOException {}

  static class Reader {

    public Reader() {}

    public String getFilename(String path) {
      Path pth = Paths.get(path);
      return pth.toString();
    }

    public String getContents(String path) throws IOException {
      FileReader fr = new FileReader(path);
      BufferedReader br = new BufferedReader(fr);
      StringBuilder sb = new StringBuilder();
      String contents;
      while ((contents = br.readLine()) != null) {
        sb.append(contents);
      }

      return sb.toString();
    }

    public String[] getFilenameAndContents(String path) throws IOException {
      String[] output = new String[] {this.getFilename(path), this.getContents(path)};
      return output;
    }
  }
}

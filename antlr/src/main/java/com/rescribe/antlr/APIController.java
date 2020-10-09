package com.rescribe.antlr;

import com.rescribe.antlr.parse.FileHandler;
import com.rescribe.antlr.parse.FileInput;
import com.rescribe.antlr.parse.schema.File;
import javax.persistence.Entity;
import javax.validation.Valid;
import lombok.Data;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
class APIController {
  File lastOutput;

  @Data
  @Entity
  private static class HelloResponse {
    private final String message;

    public HelloResponse(String message) {
      this.message = message;
    }
  }

  @GetMapping("/ping")
  @ResponseBody
  public void ping() {}

  @GetMapping("/hello")
  @ResponseBody
  HelloResponse hello() {
    return new HelloResponse("hello world!");
  }

  @GetMapping("/lastOutput")
  @ResponseBody
  File lastOutput() {
    return lastOutput;
  }

  @PostMapping("/processFile")
  @ResponseBody
  File processFile(@Valid @RequestBody FileInput input) throws Exception{
    // System.out.println(input);
    // long startTime = System.nanoTime();
    // System.out.println("Start: " + startTime);
    try {
      this.lastOutput = FileHandler.getFileData(input);
    } catch (Exception e) {
      throw e;
    }

    // long endTime = System.nanoTime();
    // long elapsed = endTime - startTime;
    // System.out.println("Elapsed Time : " + elapsed/1e6);
    return lastOutput;
  }
}

package com.rescribe.antlr;

import com.rescribe.antlr.parse.FileHandler;
import com.rescribe.antlr.parse.FileInput;
import com.rescribe.antlr.parse.FunctionDefinitionOutput;
import java.util.List;
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

  @Data
  @Entity
  private class HelloResponse {
    private final String message;

    public HelloResponse(String message) {
      this.message = message;
    }
  }

  @GetMapping("/ping")
  @ResponseBody
  void ping() {
    return;
  }

  @GetMapping("/hello")
  @ResponseBody
  HelloResponse hello() {
    return new HelloResponse("hello world!");
  }

  @PostMapping("/processFile")
  @ResponseBody
  List<FunctionDefinitionOutput> processFile(@Valid @RequestBody FileInput input) {
    System.out.println(input);
    return FileHandler.getFileData(input);
  }
}
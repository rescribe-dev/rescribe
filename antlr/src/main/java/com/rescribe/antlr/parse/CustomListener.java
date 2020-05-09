package com.rescribe.antlr.parse;

import com.rescribe.antlr.parse.results.Results;
import java.util.List;

public interface CustomListener {
  List<Results> getResults();
}

package com.rescribe.antlr.parse.schema;

import lombok.*;
import lombok.experimental.SuperBuilder;
import org.bson.types.ObjectId;

@AllArgsConstructor
@Data
@SuperBuilder
public class NestedObject {
  final String _id;
  Parent parent;
  Location location;

  public NestedObject() {
    this._id = new ObjectId().toHexString();
  }
}

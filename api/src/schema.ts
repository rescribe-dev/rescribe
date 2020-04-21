import { gql } from 'apollo-server-express';

export default gql`
  type File {
    name: String!
    path: String!
    mime: String!
    encoding: String!
  }
  type Query {
    hello: String!
    file(id: ID!): File!
  }
  type Mutation {
    indexFile(project: String!, repository: String!, path: String!, file: Upload!): String!
    deleteFile(id: ID!): String!
  }
`;

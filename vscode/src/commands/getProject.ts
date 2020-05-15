import * as vscode from 'vscode';
import { apolloClient } from '../utils/api';
import gql from 'graphql-tag';
import { checkAuth } from '../utils/authToken';

// interface User {
//   name: string;
//   email: string;
//   plan: string;
//   type: string;
// }

interface ProjectArgs {
  id: string;
}

interface ProjectRes {
  project: {
    name: string;
  };
}

export default async (
  context: vscode.ExtensionContext,
  args: ProjectArgs
): Promise<string> => {
  checkAuth(context);
  console.log('here');
  const res = await apolloClient.query<ProjectRes>({
    query: gql`
      query project($id: string) {
        project(id: $id) {
          name
        }
      }
    `,
    variables: {
      id: args.id,
    },
  });

  return res.data.project.name;
};
// interface UserRes {
//   user: User;
// }

// export default async (context: vscode.ExtensionContext): Promise<void> => {
// checkAuth(context);
// const userRes = await apolloClient.query<UserRes>({
//   query: gql`
//     query user {
//       user {
//         name
//         email
//         plan
//       }
//     }
//   `,
// });

// import FormData from 'form-data';
// import gql from 'graphql-tag';
// import { axiosClient } from '../utils/api';
// import { ApolloQueryResult } from 'apollo-client';
// import { GraphQLError } from 'graphql';
// import { AxiosError } from 'axios';
// import axios from 'axios';
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const { createApolloFetch } = require('apollo-fetch');

// interface GetProjectArgs {
//   id: string;
// }

// interface ResProject {
//   project: {
//     name: string;
//   };
// }

// const fetch = createApolloFetch({
//   uri: 'localhost:8080/graphql',
// });

// export const getProject = async (args: GetProjectArgs): Promise<string> => {
//   const result = await fetch({
//     query: `
//     query project($id: string) {
//       project(id: $id) {
//         name
//       }
//     }
//     `,
//     variables: { id: args.id },
//   });

//   return result;
// };

// const response = await axiosClient.query<ResProject>({
//   query: gql`
//     query project($id: string) {
//       project(id: $id) {
//         name
//       }
//     }
//   `,
//   variables: {
//     id: args.id,
//   },
// });

// return response.data.project.name;

// try {
//   const form = new FormData();
//   form.append(
//     'operations',
//     JSON.stringify({
//       query: gql`
//         query project($id: string) {
//           project(id: $id) {
//             name
//           }
//         }
//       `,
//       variables: {
//         id: args.id,
//       },
//     })
//   );
//   const map: any = 'variables.id.1';
//   form.append('map', JSON.stringify(map));
//   const res = await axiosClient.post('/graphql', form, {
//     headers: {
//       ...form.getHeaders(),
//       'content-length': form.getLengthSync(),
//     },
//     cancelToken: axios.CancelToken.source().token,
//   });

//   const apolloRes = res.data as ApolloQueryResult<ResProject>;
//   if (apolloRes.errors) {
//     throw new Error(
//       apolloRes.errors.map((elem: GraphQLError) => elem.message).join(', ')
//     );
//   }
//   return apolloRes.data.project.name;
// } catch (err) {
//   const errObj = err as AxiosError;
//   if (errObj.response) {
//     throw new Error(errObj.response.data);
//   } else {
//     throw new Error(err.message);
//   }
// }

import React, { useState } from "react";
import { Container } from "reactstrap";
import gql from "graphql-tag";
import { PageProps } from "gatsby";

import "./login.scss";

import Layout from "../layouts/index";
import SEO from "../components/seo";
import { client } from "../utils/apollo";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AccountPageDataType {}

interface User {
  name: string;
  email: string;
  plan: string;
  type: string;
}

interface UserDataType {
  user: User;
}

declare global {
  interface Window {
    grecaptcha: any;
  }
}

const LoginPage = (_args: PageProps<AccountPageDataType>) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  client
    .query<UserDataType>({
      query: gql`
        query user {
          user {
            name
            email
            plan
          }
        }
      `,
      variables: {},
    })
    .then((res) => {
      console.log(res.data);
      setUser(res.data.user);
    });
  return (
    <Layout>
      <SEO title="Account" />
      <Container
        style={{
          marginTop: "3rem",
          marginBottom: "5rem",
        }}
      >
        <div>
          {user === undefined ? (
            <div>loading</div>
          ) : (
            <div>
              <p>{JSON.stringify(user)}</p>
            </div>
          )}
        </div>
      </Container>
    </Layout>
  );
};

export default LoginPage;

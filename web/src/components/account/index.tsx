import React, { useState } from "react";
import { Container } from "reactstrap";
import { PageProps } from "gatsby";

import "./index.scss";

import SEO from "../../components/seo";
import { useDispatch } from "react-redux";
import { User, AuthActionTypes } from "../../state/auth/types";
import { store } from "../../state/reduxWrapper";
import { getUser } from "../../state/auth/getters";
import { AppThunkDispatch } from "../../state/thunk";
import { thunkGetUser } from "../../state/auth/thunks";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AccountPageDataType {}

declare global {
  interface Window {
    grecaptcha: any;
  }
}

const AccountPage = (_args: PageProps<AccountPageDataType>) => {
  const [user, setUser] = useState<User | undefined>(getUser());
  if (!user) {
    store.subscribe(() => {
      setUser(getUser());
    });
    const dispatchAuthThunk = useDispatch<AppThunkDispatch<AuthActionTypes>>();
    dispatchAuthThunk(thunkGetUser());
  }
  return (
    <>
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
    </>
  );
};

export default AccountPage;

import { AppThunkAction } from '../thunk';
import gql from 'graphql-tag';
import { client } from '../../utils/apollo';
import { LoginInput, User } from './types';
import { login, setUser, logout } from './actions';

interface LoginRes {
  login: string;
}

const checkAuth = async (args: LoginInput): Promise<string> => {
  const apolloRes = await client.mutate<LoginRes>({
    mutation: gql`
      mutation login($email: String!, $password: String!) {
        login(email: $email, password: $password)
      }
    `,
    variables: args,
  });
  if (apolloRes.data) {
    return apolloRes.data.login;
  } else {
    throw new Error('cannot find apollo data');
  }
};

export const thunkLogin = (
  args: LoginInput
): AppThunkAction<Promise<void>> => async (dispatch) => {
  const authToken = await checkAuth(args);
  dispatch(
    login({
      authToken,
      ...args,
      loggedIn: true,
    })
  );
};

interface LogoutRes {
  logout: string;
}

export const runLogout = async (): Promise<string> => {
  const apolloRes = await client.mutate<LogoutRes>({
    mutation: gql`
      mutation logout {
        logout
      }
    `,
    variables: {},
  });
  if (apolloRes.data) {
    return apolloRes.data.logout;
  } else {
    throw new Error('cannot find apollo data');
  }
};

export const thunkLogout = (): AppThunkAction<Promise<void>> => async (
  dispatch
) => {
  await runLogout();
  dispatch(logout());
};

interface UserDataType {
  user: User;
}

const getUser = async (): Promise<User> => {
  const apolloRes = await client.query<UserDataType>({
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
  });
  if (apolloRes.data) {
    return apolloRes.data.user;
  } else {
    throw new Error('cannot find apollo data');
  }
};

export const thunkGetUser = (): AppThunkAction<Promise<void>> => async (
  dispatch
) => {
  const user = await getUser();
  dispatch(setUser(user));
};

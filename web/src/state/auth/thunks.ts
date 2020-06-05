import { AppThunkAction } from '../thunk';
import { client } from '../../utils/apollo';
import { login, setUser, logout } from './actions';
import {
  Logout,
  LogoutMutation,
  LoginMutationVariables,
  LoginMutation,
  Login,
  LogoutMutationVariables,
  User,
  UserQuery,
  UserQueryVariables,
} from '../../lib/generated/datamodel';
import { UserType } from './types';

const checkAuth = async (args: LoginMutationVariables): Promise<string> => {
  const apolloRes = await client.mutate<LoginMutation, LoginMutationVariables>({
    mutation: Login,
    variables: args,
  });
  if (apolloRes.data) {
    return apolloRes.data.login;
  } else {
    throw new Error('cannot find apollo data');
  }
};

export const thunkLogin = (
  args: LoginMutationVariables
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

export const runLogout = async (): Promise<string> => {
  const apolloRes = await client.mutate<
    LogoutMutation,
    LogoutMutationVariables
  >({
    mutation: Logout,
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

const getUser = async (): Promise<UserType> => {
  const apolloRes = await client.query<UserQuery, UserQueryVariables>({
    query: User,
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

import { navigate, PageProps } from "gatsby";
import { isLoggedIn } from "../state/auth/getters";

interface Input extends PageProps {
  component: (args: PageProps) => JSX.Element;
}

const PrivateRoute = (args: Input) => {
  if (!isLoggedIn()) {
    navigate("/login");
    return null;
  }
  const pageArgs: PageProps = args;
  return args.component(pageArgs);
};

export default PrivateRoute;

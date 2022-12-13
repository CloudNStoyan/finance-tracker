import { AuthCredentials, sendLogin } from "../state/authSlice";
import { useAppDispatch, useAppSelector } from "../state/hooks";

const useAuth = () => {
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((state) => state.authReducer.status);

  const authError = useAppSelector((state) => state.authReducer.error);

  const login = (authCredentials: AuthCredentials) => {
    void dispatch(sendLogin(authCredentials));
  };

  return { authError, authStatus, login };
};

export default useAuth;

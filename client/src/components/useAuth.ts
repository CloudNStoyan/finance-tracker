import { AuthCredentials, sendLogin, sendRegister } from "../state/authSlice";
import { useAppDispatch, useAppSelector } from "../state/hooks";

const useAuth = () => {
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((state) => state.authReducer.status);

  const authError = useAppSelector((state) => state.authReducer.error);

  const login = (authCredentials: AuthCredentials) => {
    void dispatch(sendLogin(authCredentials));
  };

  const register = (authCredentials: AuthCredentials) => {
    void dispatch(sendRegister(authCredentials));
  };

  return { authError, authStatus, login, register };
};

export default useAuth;

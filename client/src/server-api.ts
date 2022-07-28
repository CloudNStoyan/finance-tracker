import axios from "axios";

const SERVER_URL = "http://localhost:5010";

export interface SessionData {
  status: number;
  sessionKey: string;
}

export const login = async (
  username: string,
  password: string,
  recaptchaToken: string
) => {
  return axios.post<SessionData>(`${SERVER_URL}/auth/login`, {
    username,
    password,
    recaptchaToken,
  });
};

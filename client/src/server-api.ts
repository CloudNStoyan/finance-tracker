import axios from "axios";
import { IconKey } from "./infrastructure/Icons";

const SERVER_URL = "http://localhost:5010";

export interface SessionData {
  status: number;
  sessionKey: string;
}

export interface ServerError {
  status: number;
  error: string;
}

export interface Category {
  categoryId?: number;
  name: string;
  bgColor: string;
  icon: IconKey;
  order: number;
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

export const register = async (
  username: string,
  password: string,
  recaptchaToken: string
) => {
  return axios.post<ServerError>(`${SERVER_URL}/auth/register`, {
    username,
    password,
    recaptchaToken,
  });
};

export const getCategoryById = async (categoryId: number) => {
  return axios.get<Category>(`${SERVER_URL}/category?categoryId=${categoryId}`);
};

export const createOrEditCategory = async (category: Category) => {
  const url = `${SERVER_URL}/category`;
  if (Number.isInteger(category.categoryId) && category.categoryId > 0) {
    return axios.put<Category>(url, category);
  }

  //create
  return axios.post<Category>(url, category);
};

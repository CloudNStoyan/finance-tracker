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

export interface Transaction {
  transactionId?: number;
  categoryId?: number;
  label: string;
  confirmed: boolean;
  transactionDate: string;
  type: "expense" | "income";
  value: number;
}

export interface User {
  username: string;
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

export const getMe = async () => {
  return axios.get<User>(`${SERVER_URL}/auth/me`);
};

export const getCategories = async () => {
  return axios.get<Category[]>(`${SERVER_URL}/category/getAll`);
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

export const deleteCategory = async (categoryId: number) => {
  return axios.delete<Category>(
    `${SERVER_URL}/category?categoryId=${categoryId}`
  );
};

export const createOrEditTransaction = async (transaction: Transaction) => {
  const url = `${SERVER_URL}/transaction`;

  if (
    Number.isInteger(transaction.transactionId) &&
    transaction.transactionId > 0
  ) {
    return axios.put<Transaction>(url, transaction);
  }

  //create
  return axios.post<Transaction>(url, transaction);
};

export const getTransactionById = async (transactionId: number) => {
  return axios.get<Transaction>(
    `${SERVER_URL}/transaction?transactionId=${transactionId}`
  );
};

export const deleteTransaction = async (transactionId: number) => {
  return axios.delete<Transaction>(
    `${SERVER_URL}/transaction?transactionId=${transactionId}`
  );
};

export const getTransactions = async () => {
  return axios.get<Transaction[]>(`${SERVER_URL}/transaction/all`);
};

export const getTransactionsByMonth = async (month: number, year: number) => {
  return axios.get<Transaction[]>(
    `${SERVER_URL}/transaction/all/month?month=${month}&year=${year}`
  );
};

export const getTransactionsByDate = async (date: Date) => {
  return axios.get<Transaction[]>(
    `${SERVER_URL}/transaction/all/date?transactionDate=${date.toJSON()}`
  );
};

export const getTransactionsBySearch = async (searchQuery: string) => {
  return axios.get<Transaction[]>(
    `${SERVER_URL}/transaction/all/search?searchQuery=${searchQuery}`
  );
};

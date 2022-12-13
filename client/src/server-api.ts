import axios from "axios";
import { DateOnlyToString } from "./infrastructure/CustomDateUtils";
import { IconKey } from "./infrastructure/Icons";

const SERVER_URL =
  process.env.NODE_ENV === "production" ? "/api" : "http://localhost:5010";

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
}

export interface Transaction {
  transactionId?: number;
  categoryId?: number;
  label: string;
  confirmed: boolean;
  transactionDate: string;
  type: "expense" | "income";
  value: number;
  details?: string;
  repeat?: "weekly" | "monthly" | "yearly";
  repeatEnd?: string;
}

export interface TransactionEvent {
  event: "update" | "create" | "delete";
  transaction: Transaction;
}

export interface User {
  username: string;
}

export interface Balance {
  balance: number;
}

export const loginV2 = async (
  username: string,
  password: string,
  recaptchaToken: string
) => {
  const response = await fetch(`${SERVER_URL}/auth/login`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password, recaptchaToken }),
    method: "POST",
    credentials: "include",
  });

  const data = (await response.json()) as SessionData | ServerError;

  return data;
};

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

export const logout = async () => {
  return axios.post<User>(`${SERVER_URL}/auth/logout`);
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

export const createOrEditTransaction = async (
  transaction: Transaction,
  repeatMode?: "thisAndForward" | "onlyThis"
) => {
  const url = !repeatMode
    ? `${SERVER_URL}/transaction`
    : `${SERVER_URL}/transaction?${repeatMode}=true`;

  if (
    Number.isInteger(transaction.transactionId) &&
    transaction.transactionId > 0
  ) {
    return axios.put<TransactionEvent[]>(url, transaction);
  }

  //create
  return axios.post<TransactionEvent[]>(url, transaction);
};

export const getTransactionById = async (transactionId: number) => {
  return axios.get<Transaction>(
    `${SERVER_URL}/transaction?transactionId=${transactionId}`
  );
};

export const deleteTransaction = async (
  transactionId: number,
  repeatMode?: "thisAndForward" | "onlyThis",
  date?: Date
) => {
  let url = `${SERVER_URL}/transaction?transactionId=${transactionId}`;

  if (repeatMode == "onlyThis") {
    url += `&onlyThis=true`;
  }

  if (date) {
    url = url + `&instanceDate=${DateOnlyToString(date)}`;
  }

  return axios.delete<TransactionEvent[]>(url);
};

export const getTransactions = async () => {
  return axios.get<Transaction[]>(`${SERVER_URL}/transaction/all`);
};

export const getTransactionsBeforeAndAfterDate = async (
  afterDate: Date,
  beforeDate: Date
) => {
  return axios.get<Transaction[]>(
    `${SERVER_URL}/transaction/all/range?afterDate=${DateOnlyToString(
      afterDate
    )}&beforeDate=${DateOnlyToString(beforeDate)}`
  );
};

export const getStartBalanceByMonth = async (date: Date) => {
  return axios.get<Balance>(
    `${SERVER_URL}/transaction/balance?date=${DateOnlyToString(date)}`
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

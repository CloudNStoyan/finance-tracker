import { IconButton, InputAdornment, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import React, { useEffect, useState } from "react";
import {
  Category,
  getCategories,
  getTransactions,
  Transaction,
} from "../server-api";
import axios from "axios";
import TransactionInline from "../components/TransactionInline";
import DefaultCategory from "../state/DefaultCategory";

const SearchPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchedTransactions, setSearchedTransactions] = useState<
    Transaction[]
  >([]);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchApi = async () => {
      try {
        const resp = await getTransactions();

        if (resp.status !== 200) {
          return;
        }

        setTransactions(resp.data);
      } catch (error) {
        if (!axios.isAxiosError(error)) {
          return;
        }
      }
    };

    void fetchApi();
  }, []);

  useEffect(() => {
    const fetchApi = async () => {
      try {
        const resp = await getCategories();

        if (resp.status !== 200) {
          return;
        }

        setCategories(resp.data);
      } catch (error) {
        if (!axios.isAxiosError(error)) {
          return;
        }
      }
    };

    void fetchApi();
  }, []);

  useEffect(() => {
    setSearchedTransactions(
      transactions.filter((transaction) => {
        if (transaction.label.toLowerCase().includes(search.toLowerCase())) {
          return transaction;
        }

        if (transaction.value.toString().includes(search)) {
          return transaction;
        }

        const transactionCategory =
          categories.find((cat) => cat.categoryId === transaction.categoryId) ??
          DefaultCategory;

        if (
          transactionCategory.name
            .toLowerCase()
            .includes(search.toLocaleLowerCase())
        ) {
          return transaction;
        }
      })
    );
  }, [search, transactions, categories]);

  return (
    <div className="h-full">
      <div className="px-5 mt-2">
        <TextField
          onChange={(e) => setSearch(e.target.value)}
          onBlur={(e) => setSearch(e.target.value)}
          value={search}
          label="Search"
          className="w-full"
          variant="standard"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => console.log("pew?")}>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </div>
      <div className="px-5 mt-2 flex flex-col gap-2">
        {searchedTransactions.map((transaction, idx) => (
          <TransactionInline
            transaction={transaction}
            key={idx}
            category={
              categories.find(
                (cat) => cat.categoryId === transaction.categoryId
              ) ?? DefaultCategory
            }
          />
        ))}
      </div>
    </div>
  );
};

export default SearchPage;

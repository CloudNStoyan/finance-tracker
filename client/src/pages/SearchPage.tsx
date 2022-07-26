import { InputAdornment, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useEffect, useState } from "react";
import { getTransactionsBySearch, Transaction } from "../server-api";
import axios from "axios";
import DefaultCategory from "../state/DefaultCategory";
import SearchTransaction from "../components/SearchTransaction";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { fetchCategories } from "../state/categorySlice";
import SearchPageStyled from "./styles/SearchPage.styled";

const SearchPage = () => {
  const [alreadySearched, setAlreadySearched] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchedTransactions, setSearchedTransactions] = useState<
    Transaction[]
  >([]);
  const [search, setSearch] = useState("");
  const dispatch = useAppDispatch();
  const categories = useAppSelector(
    (state) => state.categoriesReducer.categories
  );

  const categoriesStatus = useAppSelector(
    (state) => state.categoriesReducer.status
  );

  useEffect(() => {
    if (categoriesStatus === "idle") {
      void dispatch(fetchCategories());
    }
  }, [categoriesStatus, dispatch]);

  useEffect(() => {
    if (
      alreadySearched.includes(search) ||
      search === null ||
      search.trim().length === 0
    ) {
      return;
    }

    const fetchApi = async () => {
      try {
        const httpResponse = await getTransactionsBySearch(search);

        if (httpResponse.status !== 200) {
          return;
        }

        const newTransactions = httpResponse.data.filter(
          (newTransaction) =>
            transactions.findIndex(
              (transaction) =>
                transaction.transactionId === newTransaction.transactionId
            ) === -1
        );

        setTransactions([...newTransactions, ...transactions]);
        setAlreadySearched([search, ...alreadySearched]);
      } catch (error) {
        if (!axios.isAxiosError(error)) {
          return;
        }
      }
    };

    void fetchApi();
  }, [search, dispatch, alreadySearched, transactions]);

  useEffect(() => {
    if (search === null || search.trim().length === 0) {
      setSearchedTransactions([]);
      return;
    }

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
    <SearchPageStyled>
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
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </div>
      <div className="px-5 my-2 flex flex-col gap-2 transactions-container">
        {(search === null || search.trim().length === 0) && (
          <div className="text-center">
            Find your transactions by name, category, notes or value.
          </div>
        )}
        {search !== null &&
          search.trim().length > 0 &&
          searchedTransactions.length === 0 && (
            <div className="text-center">
              <p className="font-xl font-bold">No transaction found</p>
              <p className="font-md">
                Make sure the text you&#39;ve entered is correct.
              </p>
            </div>
          )}
        {searchedTransactions.map((transaction, idx) => (
          <SearchTransaction
            transaction={transaction}
            key={`${transaction.transactionId}-${idx}`}
            category={
              categories.find(
                (cat) => cat.categoryId === transaction.categoryId
              ) ?? DefaultCategory
            }
          />
        ))}
      </div>
    </SearchPageStyled>
  );
};

export default SearchPage;

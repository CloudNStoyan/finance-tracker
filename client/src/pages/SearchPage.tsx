import { CircularProgress, InputAdornment, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useEffect, useState } from "react";
import { Transaction } from "../server-api";
import SearchTransaction from "../components/SearchTransaction";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { fetchCategories } from "../state/categorySlice";
import { styled } from "../infrastructure/ThemeManager";
import { FilterSearchTransactions } from "../infrastructure/TransactionsBuisnessLogic";
import {
  addSearchQuery,
  fetchTransactionsByQuery,
} from "../state/transactionSlice";

const SearchPageStyled = styled.div`
  display: flex;
  flex-flow: column;
  max-height: calc(100vh - 50px);

  .transactions-container {
    overflow: hidden;
    overflow-y: scroll;
    padding-bottom: 10px;
    max-width: 100vw;
  }
`;

const SearchPage = () => {
  const transactions = useAppSelector(
    (state) => state.transactionsReducer.transactions
  );
  const searchStatus = useAppSelector(
    (state) => state.transactionsReducer.searchTransactionStatus
  );

  const searchedQueries = useAppSelector(
    (state) => state.transactionsReducer.searchQueries
  );

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
      search === null ||
      search.trim().length === 0 ||
      searchedQueries.includes(search)
    ) {
      return;
    }

    dispatch(addSearchQuery(search));

    void dispatch(fetchTransactionsByQuery({ search }));
  }, [dispatch, search, searchedQueries]);

  useEffect(() => {
    if (
      search === null ||
      search.trim().length === 0 ||
      searchStatus === "loading"
    ) {
      setSearchedTransactions([]);
      return;
    }

    setSearchedTransactions(
      FilterSearchTransactions(transactions, search, categories)
    );
  }, [search, transactions, categories, searchStatus]);

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
          autoComplete="off"
          id="Search"
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
        {searchStatus === "loading" && (
          <div className="flex justify-center items-center gap-5 mt-2">
            <CircularProgress size={20} />
            <span>Searching...</span>
          </div>
        )}
        {search !== null &&
          search.trim().length > 0 &&
          searchedTransactions.length === 0 &&
          searchStatus === "succeeded" && (
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
          />
        ))}
      </div>
    </SearchPageStyled>
  );
};

export default SearchPage;

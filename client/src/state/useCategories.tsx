import axios from "axios";
import { useEffect } from "react";
import { getCategories } from "../server-api";
import { categoriesWereFetched, setCategories } from "./categorySlice";
import { useAppDispatch, useAppSelector } from "./hooks";

let isFetching = false;

const useCategories = () => {
  const dispatch = useAppDispatch();
  const { categoriesAreFetched, categories } = useAppSelector(
    (state) => state.categoriesReducer
  );

  useEffect(() => {
    if (categoriesAreFetched || isFetching) {
      return;
    }

    const fetchApi = async () => {
      try {
        isFetching = true;
        const resp = await getCategories();

        if (resp.status !== 200) {
          return;
        }

        dispatch(setCategories(resp.data));
        dispatch(categoriesWereFetched());
      } catch (err) {
        if (!axios.isAxiosError(err)) {
          return;
        }
      } finally {
        isFetching = false;
      }
    };

    void fetchApi();
  }, [dispatch, categoriesAreFetched]);

  return categories;
};

export default useCategories;

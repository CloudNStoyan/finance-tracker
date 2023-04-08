import { useMemo } from "react";
import { useAppSelector } from "../state/hooks";
import DefaultCategory from "../state/DefaultCategory";

const useCategory = (categoryId: number) => {
  const categories = useAppSelector(
    (state) => state.categoriesReducer.categories
  );

  const category = useMemo(() => {
    return (
      categories.find((cat) => cat.categoryId === categoryId) ?? DefaultCategory
    );
  }, [categoryId, categories]);

  return category;
};

export default useCategory;

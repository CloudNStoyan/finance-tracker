import { IconButton, styled, TextField } from "@mui/material";
import React, { FunctionComponent, useEffect, useState } from "react";
import CategoryPageStyled from "./styles/CategoryPage.styled";
import ColorComponent from "../components/ColorComponent";
import CheckIcon from "@mui/icons-material/Check";
import Icons, { IconKey } from "../infrastructure/Icons";
import IconComponent from "../components/IconComponent";
import { Category, createOrEditCategory, getCategoryById } from "../server-api";
import { useParams } from "react-router-dom";

export type UseParamsCategoryType = { categoryId: number };

const INITIAL_COLOR_INDEX = 20;

const COLORS = [
  "rgb(243, 208, 79)",
  "rgb(249, 196, 99)",
  "rgb(243, 156, 18)",
  "rgb(221, 138, 6)",
  "rgb(211, 84, 0)",
  "rgb(178, 73, 2)",
  "rgb(166, 52, 20)",
  "rgb(244, 98, 98)",
  "rgb(218, 64, 64)",
  "rgb(195, 25, 58)",
  "rgb(112, 11, 30)",
  "rgb(242, 136, 177)",
  "rgb(211, 77, 129)",
  "rgb(189, 102, 168)",
  "rgb(163, 61, 138)",
  "rgb(115, 89, 182)",
  "rgb(94, 74, 146)",
  "rgb(102, 135, 231)",
  "rgb(57, 96, 209)",
  "rgb(82, 188, 232)",
  "rgb(22, 157, 213)",
  "rgb(0, 112, 177)",
  "rgb(86, 205, 208)",
  "rgb(0, 158, 162)",
  "rgb(87, 218, 187)",
  "rgb(25, 188, 150)",
  "rgb(50, 157, 105)",
  "rgb(41, 117, 65)",
  "rgb(39, 174, 96)",
  "rgb(91, 201, 83)",
  "rgb(168, 200, 91)",
  "rgb(173, 183, 73)",
  "rgb(156, 166, 110)",
  "rgb(155, 136, 43)",
  "rgb(116, 80, 21)",
  "rgb(144, 93, 101)",
  "rgb(177, 153, 147)",
  "rgb(168, 192, 168)",
  "rgb(102, 134, 134)",
  "rgb(176, 182, 186)",
  "rgb(97, 109, 117)",
  "rgb(57, 72, 82)",
];

const CustomTextField = styled(TextField)({
  "& .MuiInputBase-input": {
    color: "white",
  },
  "& label.Mui-focused ": {
    color: "white",
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "white",
  },
  "& .MuiInput-underline:before": {
    borderBottomColor: "white",
  },
  "& label": {
    color: "white",
  },
});

const categoryIcons = Object.keys(Icons);

const CategoryPage: FunctionComponent<{ hasCategoryId: boolean }> = ({
  hasCategoryId,
}) => {
  const [color, setColor] = useState(COLORS[INITIAL_COLOR_INDEX]);
  const [colorIdx, setColorIdx] = useState(INITIAL_COLOR_INDEX);
  const [showIcons, setShowIcons] = useState(false);

  const [iconKey, setIconKey] = useState<IconKey>("money");
  const [iconIdx, setIconIdx] = useState(0);

  const [categoryName, setCategoryName] = useState("");

  const { categoryId } = useParams();

  useEffect(() => {
    if (!hasCategoryId) {
      return;
    }

    const fetchCategory = async () => {
      const resp = await getCategoryById(Number(categoryId));

      if (resp.status !== 200) {
        return;
      }

      const category = resp.data;

      setCategoryName(category.name);
      setColor(category.bgColor);
      setColorIdx(COLORS.indexOf(category.bgColor));
      setIconKey(category.icon);
      setIconIdx(categoryIcons.indexOf(category.icon));
    };

    void fetchCategory();
  }, [hasCategoryId, categoryId]);

  const onColorClick = (bgColor: string, idx: number) => {
    setColor(bgColor);
    setColorIdx(idx);
  };

  const onIconClick = (key: IconKey, idx: number) => {
    setIconIdx(idx);
    setIconKey(key);
  };

  const onSubmit = async () => {
    if (categoryName.length === 0) {
      return;
    }

    try {
      const category: Category = {
        name: categoryName.trim(),
        bgColor: color,
        icon: iconKey,
        order: 100,
      };

      if (hasCategoryId) {
        category.categoryId = Number(categoryId);
      }

      await createOrEditCategory(category);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <CategoryPageStyled categoryColor={color}>
      <div className="relative fields-wrapper">
        <div className="pt-5 pb-10 flex items-center fields shadow-md">
          <IconButton
            onClick={() => setShowIcons(!showIcons)}
            className="border-2 text-white border-white border-dashed mx-5"
          >
            {Icons[iconKey]}
          </IconButton>
          <CustomTextField
            label="Category name"
            variant="standard"
            color="primary"
            className="flex-1 mr-10"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            onBlur={(e) => setCategoryName(e.target.value)}
          />
        </div>
        <IconButton
          onClick={() => void onSubmit()}
          size="large"
          className="dark:bg-purple-500 text-white bg-blue-500 save-btn focus:scale-110"
        >
          <CheckIcon />
        </IconButton>
      </div>
      {showIcons ? (
        <div className="m-5 flex flex-wrap gap-5 justify-center items-center">
          {categoryIcons.map((iconKey: IconKey, idx: number) => (
            <IconComponent
              onClick={onIconClick}
              iconKey={iconKey}
              idx={idx}
              key={idx}
              selected={idx === iconIdx}
            />
          ))}
        </div>
      ) : (
        <div className="m-5 flex flex-wrap gap-5 justify-center items-center">
          {COLORS.map((color: string, idx: number) => (
            <ColorComponent
              bgColor={color}
              selected={idx === colorIdx}
              onClick={onColorClick}
              key={idx}
              idx={idx}
            />
          ))}
        </div>
      )}
    </CategoryPageStyled>
  );
};

export default CategoryPage;

export const RemoveDuplicates = (arr: string[]) => {
  const uniqueArr: string[] = [];

  arr.forEach((el) => {
    if (uniqueArr.includes(el)) {
      return;
    }

    uniqueArr.push(el);
  });

  return uniqueArr;
};

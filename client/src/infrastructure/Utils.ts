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

export const ValidateEmail = (email: string) => {
  return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);
};

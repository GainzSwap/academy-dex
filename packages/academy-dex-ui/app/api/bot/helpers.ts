export const randomString = (len: number): string => {
  const stringSeed = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const maxChrIndex = stringSeed.length - 1;

  let string = "";

  for (let index = 0; index < len; index++) {
    const chrIndex = +(Math.random() * maxChrIndex).toFixed(0);

    string = `${string}${stringSeed[chrIndex]}`;
  }

  return string;
};

export const matchStrings = ["ContractFunctionExecutionError:", " Error: ", "TransactionExecutionError:"];
const processedMatchString = matchStrings.reduce((acc, curr, index) => {
  acc += curr;

  if (index !== matchStrings.length - 1) {
    acc += "|";
  }

  return acc;
}, "");

export const errorMsg = (msg: string) => {
  const regEx = new RegExp("[" + processedMatchString + "](\n)?(.*)", "g");
  const error =
    msg.match("reason:\n.*")?.at(0)?.replace("reason:\n", "") ??
    msg.match(regEx)?.at(0)?.replace(processedMatchString, "");
  return error;
};

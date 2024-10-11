import { errorMsg } from "./TransactionWaitingIcon/helpers";

export default function FormErrorMessage({ message }: { message?: string }) {
  return !message ? null : (
    <div style={{ display: "inline-block" }} className="invalid-feedback">
      {errorMsg(message)}
    </div>
  );
}

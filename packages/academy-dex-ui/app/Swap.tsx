import ElementWrapper from "~~/components/ElementWrapper";
import { SwapTokensBody } from "~~/components/Swap";

export default function Swap() {
  return (
    <div className="col-sm-12 col-lg-8 col-xxl-6">
      <ElementWrapper title="Swap Tokens">
        <SwapTokensBody />
      </ElementWrapper>
    </div>
  );
}

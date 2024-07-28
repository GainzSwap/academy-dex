import { useMemo } from "react";
import TokenIcon from "../TokenIcon";
import { TokenData } from "./types";

export default function TokensSelect({
  title,
  tokens,
  selected,
  setSelected,
}: {
  title: "From" | "To";
  tokens: TokenData[];
  selected?: TokenData;
  setSelected: (token: TokenData) => void;
}) {
  const id = `${title}-TokenDropdown`;

  // const tokens = useMemo(
  //   () => (title === "From" ? _tokens.filter(token => +token.balance != 0) : _tokens),
  //   [_tokens, title],
  // );

  return (
    <div className="mb-3 form-group">
      <label>{title}</label>

      <div className="dropdown mb-3">
        <button
          data-testid={`tokenSelect-${title}`}
          className="form-control dropdown-toggle"
          type="button"
          id={id}
          data-bs-toggle="dropdown"
          aria-expanded="false"
          style={{ overflow: "hidden" }}
        >
          {selected ? (
            <>
              {" "}
              <TokenIcon src={selected.iconSrc} identifier={""} /> {selected.identifier.split("-")[0]}
            </>
          ) : (
            "Select"
          )}
        </button>
        {!!tokens.length && (
          <ul
            data-testid={`tokenSelect-${title}-list`}
            className="dropdown-menu"
            aria-labelledby={id}
            style={{
              maxHeight: "250px",
              overflowY: "scroll",
            }}
          >
            {tokens.map(token => (
              <li key={token.identifier} onClick={() => setSelected(token)}>
                <a className="dropdown-item btn">
                  {" "}
                  <TokenIcon src={token.iconSrc} identifier={""} /> {token.identifier}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

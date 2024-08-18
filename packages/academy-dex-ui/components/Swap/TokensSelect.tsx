import TokenIcon from "../TokenIcon";
import { TokenData } from "./types";
import Dropdown from "react-bootstrap/Dropdown";

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
  // const tokens = useMemo(
  //   () => (title === "From" ? _tokens.filter(token => +token.balance != 0) : _tokens),
  //   [_tokens, title],
  // );

  return (
    <div className="mb-3 form-group">
      <label>{title}</label>
      <Dropdown className="dropdown mb-3">
        <Dropdown.Toggle className="form-control dropdown-toggle" id="dropdown-basic">
          {selected ? (
            <>
              {" "}
              <TokenIcon src={selected.iconSrc} identifier={""} /> {selected.identifier.split("-")[0]}
            </>
          ) : (
            "Select"
          )}
        </Dropdown.Toggle>

        {!!tokens.length && (
          <Dropdown.Menu
            style={{
              maxHeight: "250px",
              overflowY: "scroll",
            }}
          >
            {tokens.map(token => (
              <Dropdown.Item key={token.identifier} onClick={() => setSelected(token)}>
                <TokenIcon src={token.iconSrc} identifier={""} /> {token.identifier}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        )}
      </Dropdown>
    </div>
  );
}

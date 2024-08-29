import TokenIcon from "../TokenIcon";

export default function InputIcon({ position, identifier }: { position: "prepend" | "append"; identifier: string }) {
  return (
    <div className={`input-group-${position}`} style={{ overflow: "hidden" }}>
      <div className="input-group-text" style={{ height: "100%" }}>
        <TokenIcon identifier={identifier} />
      </div>
    </div>
  );
}

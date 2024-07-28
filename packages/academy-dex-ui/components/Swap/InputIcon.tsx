import TokenIcon from "../TokenIcon";

export default function InputIcon({
  position,
  src,
  identifier,
}: {
  position: "prepend" | "append";
  src?: string;
  identifier: string;
}) {
  return (
    <div className={`input-group-${position}`} style={{ overflow: "hidden" }}>
      <div className="input-group-text" style={{ height: "100%" }}>
        <TokenIcon src={src} identifier={identifier} />
      </div>
    </div>
  );
}

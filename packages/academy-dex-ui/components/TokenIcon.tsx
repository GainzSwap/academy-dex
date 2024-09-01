import ServerImage from "./ImageLoader";

export default function TokenIcon({ identifier, ...props }: { identifier: string }) {
  const symbol = identifier.split("-")[0].substring(0, 5);

  return (
    <ServerImage
      src={`img/tokens/${symbol}.svg`}
      alt={symbol}
      width={15}
      height={15}
      {...props}
      style={{ marginTop: "-5px" }}
    />
  );
}

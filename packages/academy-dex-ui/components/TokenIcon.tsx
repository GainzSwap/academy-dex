import ServerImage from "./ImageLoader";

export default function TokenIcon({ src, identifier, ...props }: { src?: string; identifier: string }) {
  const alt = identifier.split("-")[0].substring(0, 5);

  return <ServerImage src={src || "img/tokens/cryptERD.svg"} alt={alt} width={15} height={15} {...props} />;
}

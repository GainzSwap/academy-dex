import Image, { ImageLoader, ImageProps } from "next/image";

const imageLoader: ImageLoader = ({ src, width, quality }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

const ServerImage = ({ alt, loader, ...props }: ImageProps) => {
  return <Image loader={!!loader ? imageLoader : imageLoader} alt={alt} {...props} />;
};

export default ServerImage;

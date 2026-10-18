import Image, { type ImageProps } from "next/image";
import { imageVariants } from "@/data/image-variants";
export function ResponsiveImage({
  src,
  alt,
  sizes,
  width,
  ...props
}: Omit<ImageProps, "src"> & { src: string }) {
  const resolvedSizes =
    sizes ?? (typeof width === "number" ? `${width}px` : "100vw");
  const srcSet = imageVariants[src];
  if (!srcSet)
    return (
      <Image
        alt={alt}
        src={src}
        sizes={resolvedSizes}
        width={width}
        {...props}
      />
    );
  return (
    <picture>
      <source srcSet={srcSet} sizes={resolvedSizes} />
      <Image
        alt={alt}
        src={src}
        sizes={resolvedSizes}
        width={width}
        {...props}
      />
    </picture>
  );
}

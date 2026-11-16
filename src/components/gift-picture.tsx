import Image from "next/image";

export function GiftPicture({
  src,
  alt,
  wide = false,
}: {
  src: string;
  alt: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "gift-photo gift-photo-wide" : "gift-photo"}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={wide ? "(max-width: 800px) 100vw, 960px" : "(max-width: 640px) 100vw, 480px"}
        className="object-cover"
        unoptimized
      />
    </div>
  );
}

import { initials } from "@/lib/utils";

export function Avatar({
  name,
  src,
  size = 48,
}: {
  name: string;
  src?: string | null;
  size?: number;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full bg-orange text-sm font-semibold text-white"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {initials(name) || "D"}
    </div>
  );
}

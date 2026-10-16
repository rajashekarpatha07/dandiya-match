import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-orange text-white hover:bg-orange-deep",
        variant === "secondary" &&
          "border border-line bg-card text-ink hover:border-gold",
        variant === "ghost" && "text-ink hover:bg-line/50",
        variant === "danger" && "bg-red text-white hover:bg-red/90",
        className,
      )}
      {...props}
    />
  );
}

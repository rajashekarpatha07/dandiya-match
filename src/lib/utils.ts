export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function formatEntryFee(fee: number | null | undefined): string {
  if (fee == null) return "Fee TBA";
  if (Number(fee) === 0) return "Free entry";
  return `₹${Number(fee).toLocaleString("en-IN")}`;
}

export function experienceLabel(value: string | null | undefined): string {
  if (value === "beginner") return "Beginner";
  if (value === "intermediate") return "Intermediate";
  if (value === "pro") return "Pro";
  return "—";
}

export function genderLabel(value: string | null | undefined): string {
  if (value === "male") return "Male";
  if (value === "female") return "Female";
  if (value === "other") return "Other";
  if (value === "any") return "Any";
  return "—";
}

export function rpcErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const raw = String((error as { message: string }).message);
    const match = raw.match(/ERROR:\s*([^\n]+)/i);
    if (match?.[1]) return match[1].trim();
    return raw.replace(/^.*error:\s*/i, "").trim() || "Something went wrong";
  }
  return "Something went wrong";
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function whatsappLink(phone: string): string | null {
  const digits = digitsOnly(phone);
  if (!digits) return null;
  const withCountry =
    digits.length === 10 ? `91${digits}` : digits.replace(/^0+/, "");
  return `https://wa.me/${withCountry}`;
}

export function instagramLink(handle: string): string | null {
  const trimmed = handle.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const user = trimmed.replace(/^@/, "");
  return `https://instagram.com/${user}`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

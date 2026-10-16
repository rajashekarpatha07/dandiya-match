import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Nav } from "@/components/Nav";
import { RealtimeListener } from "@/components/RealtimeListener";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarded")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.onboarded) redirect("/onboarding");

  return (
    <div className="flex min-h-dvh flex-col md:flex-col-reverse">
      <RealtimeListener />
      <div className="flex-1 pb-16 md:pb-0">{children}</div>
      <Nav />
    </div>
  );
}

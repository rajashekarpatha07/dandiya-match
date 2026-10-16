"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/Button";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <p className="text-sm font-semibold tracking-widest text-orange uppercase">
        Kamareddy
      </p>
      <h1 className="font-display mt-2 text-4xl text-red">Dandiya Match</h1>
      <p className="mt-3 text-muted">
        Find a dandiya or garba partner for a specific venue on a specific
        night. Contact details stay private until you both accept.
      </p>
      <Button className="mt-8 w-full" disabled={loading} onClick={() => void signIn()}>
        {loading ? "Opening Google…" : "Continue with Google"}
      </Button>
      {error ? <p className="mt-3 text-sm text-red">{error}</p> : null}
      <p className="mt-8 text-center text-xs text-muted">
        18+ only. By continuing you agree to the{" "}
        <Link href="/terms" className="underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline">
          Privacy
        </Link>{" "}
        pages.
      </p>
    </main>
  );
}

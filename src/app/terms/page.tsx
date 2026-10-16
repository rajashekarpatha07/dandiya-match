import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-lg px-5 py-10">
      <Link href="/" className="text-sm font-semibold text-orange">
        ← Home
      </Link>
      <h1 className="font-display mt-4 text-3xl text-red">Terms of use</h1>
      <div className="mt-4 space-y-3 text-sm leading-6">
        <p>Dandiya Match helps people in Hyderabad find a dandiya or garba partner for a public venue on a specific night. You must be 18 or older.</p>
        <p>Meet only in public at the venue. The app does not arrange transport, tickets, or in-app chat. You are responsible for your own safety.</p>
        <p>Contact details are shared only after both people accept a match. Do not use the app to harass anyone. The owner may remove accounts that are reported.</p>
        <p>You may delete your account from the Profile page. That removes your profile, listings, requests, and matches.</p>
      </div>
    </main>
  );
}

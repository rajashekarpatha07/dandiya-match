import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-lg px-5 py-10">
      <Link href="/" className="text-sm font-semibold text-orange">
        ← Home
      </Link>
      <h1 className="font-display mt-4 text-3xl text-red">Privacy</h1>
      <div className="mt-4 space-y-3 text-sm leading-6">
        <p>We collect your Google account name and photo, the profile you enter (age, gender, experience, bio), and optional phone and Instagram.</p>
        <p>Phone and Instagram are stored in a separate contacts table. Other users can read them only after an accepted match. They are hidden again if either person unmatches.</p>
        <p>We store listings, match requests, blocks, and reports so the product can work. Reports are reviewed by the owner in the database dashboard.</p>
        <p>We do not put contact details in analytics or error logs. To delete your data, use Delete my account on the Profile page.</p>
      </div>
    </main>
  );
}

import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <Link href="/" className="text-sm font-semibold text-orange">
        ← Home
      </Link>
      <h1 className="font-display mt-4 text-4xl text-red">Terms of Use</h1>
      <p className="mt-2 text-sm text-muted">Last updated: October 2024</p>
      
      <div className="mt-6 space-y-6 text-sm leading-7">
        <section>
          <h2 className="text-lg font-semibold text-red">1. About Dandiya Match</h2>
          <p>
            Dandiya Match is a platform that helps people find dandiya/garba dance partners at specific venues on specific nights. By using this service, you agree to these terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-red">2. Eligibility</h2>
          <ul className="ml-6 list-disc space-y-2">
            <li>You must be <strong>18 years or older</strong> to use this service</li>
            <li>You must provide accurate information in your profile</li>
            <li>One account per person - no fake or duplicate accounts</li>
            <li>You are responsible for maintaining the security of your account</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-red">3. Privacy & Contact Information</h2>
          <div className="rounded-xl border-2 border-orange bg-orange/5 p-4">
            <p className="font-semibold text-orange">🔒 Your Privacy is Our Priority</p>
            <ul className="mt-2 ml-6 list-disc space-y-2">
              <li>
                <strong>Your phone number and Instagram are completely private</strong> and hidden from all users by default
              </li>
              <li>
                These contact details are <strong>only revealed when BOTH people accept a match</strong>
              </li>
              <li>
                This privacy rule is <strong>enforced at the database level</strong> (Row Level Security), not just in the app interface
              </li>
              <li>
                If either person unmatches, contact details are <strong>immediately hidden again</strong>
              </li>
              <li>
                Your profile information (name, age, gender, experience, bio) is visible to other users while browsing, but <strong>never your contact details</strong> until mutual acceptance
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-red">4. Safety Guidelines</h2>
          <ul className="ml-6 list-disc space-y-2">
            <li><strong>Always meet in public</strong> at the venue during the event</li>
            <li>Never share financial information or send money</li>
            <li>Trust your instincts - if something feels wrong, leave</li>
            <li>Tell a friend or family member where you're going</li>
            <li>The app does not arrange transport, tickets, or provide in-app chat</li>
            <li>You are solely responsible for your own safety</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-red">5. Acceptable Use</h2>
          <p className="font-semibold">You agree NOT to:</p>
          <ul className="ml-6 list-disc space-y-2">
            <li>Harass, bully, or intimidate other users</li>
            <li>Use the service for commercial purposes or solicitation</li>
            <li>Post inappropriate, offensive, or explicit content</li>
            <li>Impersonate others or create fake profiles</li>
            <li>Share other people's personal information without consent</li>
            <li>Use automated bots or scraping tools</li>
            <li>Attempt to access other users' accounts or bypass security</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-red">6. Reporting & Blocking</h2>
          <ul className="ml-6 list-disc space-y-2">
            <li>You can <strong>block</strong> any user - they won't see your listings or be able to contact you</li>
            <li>You can <strong>report</strong> users who violate these terms</li>
            <li>Reports are reviewed by administrators</li>
            <li>We reserve the right to remove accounts that violate terms or receive multiple reports</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-red">7. Account Deletion</h2>
          <p>
            You may delete your account at any time from the Profile page. This will permanently remove:
          </p>
          <ul className="ml-6 list-disc space-y-2">
            <li>Your profile and all personal information</li>
            <li>Your partner listings</li>
            <li>All match requests (sent and received)</li>
            <li>Your matches and contact revelations</li>
          </ul>
          <p className="mt-2">
            <strong>Note:</strong> Deletion is permanent and cannot be undone.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-red">8. Limitation of Liability</h2>
          <ul className="ml-6 list-disc space-y-2">
            <li>Dandiya Match is provided "as is" without warranties</li>
            <li>We do not screen users or verify their identities</li>
            <li>We are not responsible for user behavior or actions</li>
            <li>We are not liable for any harm, loss, or damage resulting from use of the service</li>
            <li>We do not guarantee event details, venue information, or availability</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-red">9. Service Modifications</h2>
          <p>
            We reserve the right to:
          </p>
          <ul className="ml-6 list-disc space-y-2">
            <li>Modify or discontinue the service at any time</li>
            <li>Update these terms (you'll be notified of significant changes)</li>
            <li>Remove content or accounts that violate these terms</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-red">10. Data & Privacy</h2>
          <p>
            Your use of Dandiya Match is also governed by our <Link href="/privacy" className="font-semibold text-orange underline">Privacy Policy</Link>, which explains:
          </p>
          <ul className="ml-6 list-disc space-y-2">
            <li>What data we collect and why</li>
            <li>How your data is stored and protected</li>
            <li>When your contact information is revealed</li>
            <li>Your data rights and choices</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-red">11. Governing Law</h2>
          <p>
            These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Kamareddy, Telangana.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-red">12. Contact</h2>
          <p>
            For questions about these terms, privacy concerns, or to report issues, please contact us through the app's report feature or via the repository on GitHub.
          </p>
        </section>

        <div className="mt-8 rounded-xl border border-line bg-card p-6">
          <p className="text-center font-semibold">
            By using Dandiya Match, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use.
          </p>
        </div>
      </div>
    </main>
  );
}

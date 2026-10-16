import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <Link href="/" className="text-sm font-semibold text-orange">
        ← Home
      </Link>
      <h1 className="font-display mt-4 text-4xl text-red">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted">Last updated: October 2024</p>
      
      <div className="mt-6 space-y-6 text-sm leading-7">
        <section>
          <h2 className="text-lg font-semibold text-red">Our Privacy Commitment</h2>
          <div className="rounded-xl border-2 border-orange bg-orange/5 p-4">
            <p className="font-semibold text-orange">🔒 Your Contact Information is Protected</p>
            <p className="mt-2">
              We take your privacy seriously. Your phone number and Instagram handle are <strong>encrypted and hidden</strong> from all users until you and another person <strong>both accept a match</strong>. This protection is enforced at the database level using Row Level Security (RLS), not just in the user interface.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-red">1. Information We Collect</h2>
          
          <h3 className="mt-4 font-semibold">1.1 Account Information</h3>
          <p>When you sign up with Google OAuth, we collect:</p>
          <ul className="ml-6 list-disc space-y-1">
            <li>Your Google account name</li>
            <li>Your Google profile photo (optional)</li>
            <li>Your email address (for authentication purposes only)</li>
          </ul>

          <h3 className="mt-4 font-semibold">1.2 Profile Information</h3>
          <p>You provide the following during onboarding:</p>
          <ul className="ml-6 list-disc space-y-1">
            <li><strong>Display Name:</strong> Visible to all users</li>
            <li><strong>Age:</strong> Visible to all users</li>
            <li><strong>Gender:</strong> Visible to all users</li>
            <li><strong>Experience Level:</strong> Visible to all users (Beginner, Intermediate, Pro)</li>
            <li><strong>Bio:</strong> Optional, visible to all users</li>
          </ul>

          <h3 className="mt-4 font-semibold">1.3 Contact Information (Private)</h3>
          <div className="ml-6 rounded-lg border border-orange/30 bg-orange/5 p-3">
            <p className="font-semibold text-orange">🔐 Stored Separately & Protected</p>
            <ul className="mt-2 list-disc space-y-1 ml-4">
              <li><strong>Phone Number:</strong> Stored in an isolated database table</li>
              <li><strong>Instagram Handle:</strong> Stored in an isolated database table</li>
            </ul>
            <p className="mt-2 text-xs">
              These are stored in a separate <code>profile_contacts</code> table with strict access controls. Other users can ONLY read them after an accepted match. If either person unmatches, access is immediately revoked.
            </p>
          </div>

          <h3 className="mt-4 font-semibold">1.4 Usage Data</h3>
          <ul className="ml-6 list-disc space-y-1">
            <li>Partner listings you create</li>
            <li>Match requests you send and receive</li>
            <li>Users you block</li>
            <li>Reports you submit</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-red">2. How We Use Your Information</h2>
          
          <h3 className="mt-4 font-semibold">2.1 To Provide the Service</h3>
          <ul className="ml-6 list-disc space-y-2">
            <li>Display your profile (name, age, gender, experience, bio) to other users browsing for partners</li>
            <li>Show your partner listings at specific venues and events</li>
            <li>Process match requests between users</li>
            <li><strong>Reveal your contact information ONLY after mutual match acceptance</strong></li>
          </ul>

          <h3 className="mt-4 font-semibold">2.2 Safety & Moderation</h3>
          <ul className="ml-6 list-disc space-y-2">
            <li>Process blocking requests (blocked users cannot see your listings)</li>
            <li>Review reports of misconduct</li>
            <li>Remove accounts that violate terms of service</li>
          </ul>

          <h3 className="mt-4 font-semibold">2.3 Service Improvement</h3>
          <ul className="ml-6 list-disc space-y-2">
            <li>Monitor app performance and fix bugs</li>
            <li>Analyze usage patterns to improve features</li>
            <li>Send important service updates (we don't send marketing emails)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-red">3. When Contact Information is Revealed</h2>
          
          <div className="rounded-xl border-2 border-orange bg-orange/10 p-4">
            <h3 className="font-semibold text-orange">The Two-Way Acceptance Rule</h3>
            <div className="mt-3 space-y-3">
              <div>
                <p className="font-semibold">Step 1: Person A sends a request to Person B</p>
                <p className="text-xs text-muted ml-4">❌ No contact information revealed yet</p>
              </div>
              
              <div>
                <p className="font-semibold">Step 2: Person B accepts the request</p>
                <p className="text-xs text-muted ml-4">✅ NOW both people can see each other's phone and Instagram</p>
              </div>
              
              <div>
                <p className="font-semibold">If Person B rejects:</p>
                <p className="text-xs text-muted ml-4">❌ Contact information remains hidden forever</p>
              </div>
              
              <div>
                <p className="font-semibold">If either person unmatches later:</p>
                <p className="text-xs text-muted ml-4">🔒 Contact information is immediately hidden again</p>
              </div>
            </div>
          </div>

          <p className="mt-4">
            <strong>Technical Implementation:</strong> This rule is enforced using PostgreSQL Row Level Security (RLS) policies. Even if someone tries to access the database directly or bypass the app interface, they cannot see protected contact information without a valid accepted match record.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-red">4. Data Storage & Security</h2>
          <ul className="ml-6 list-disc space-y-2">
            <li><strong>Database:</strong> Hosted on Supabase (PostgreSQL) with encryption at rest</li>
            <li><strong>Authentication:</strong> Handled by Supabase Auth (industry-standard security)</li>
            <li><strong>Row Level Security:</strong> Database-level access controls protect contact information</li>
            <li><strong>HTTPS:</strong> All data transmitted over secure encrypted connections</li>
            <li><strong>No Third-Party Sharing:</strong> We do not sell or share your data with third parties</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-red">5. What We DO NOT Do</h2>
          <ul className="ml-6 list-disc space-y-2">
            <li>❌ We do NOT share contact information in analytics</li>
            <li>❌ We do NOT put contact information in error logs</li>
            <li>❌ We do NOT sell your data to advertisers</li>
            <li>❌ We do NOT use your data for marketing</li>
            <li>❌ We do NOT track you across other websites</li>
            <li>❌ We do NOT require access to your contacts or photos</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-red">6. Your Rights & Choices</h2>
          
          <h3 className="mt-4 font-semibold">6.1 Access Your Data</h3>
          <p>You can view your profile and contact information anytime in the Profile page.</p>

          <h3 className="mt-4 font-semibold">6.2 Update Your Data</h3>
          <p>You can edit your profile information anytime from the Profile page.</p>

          <h3 className="mt-4 font-semibold">6.3 Delete Your Account</h3>
          <p>You can permanently delete your account from the Profile page. This will:</p>
          <ul className="ml-6 list-disc space-y-1">
            <li>Remove your profile and all personal information</li>
            <li>Delete your contact information (phone & Instagram)</li>
            <li>Remove all your partner listings</li>
            <li>Delete all match requests (sent and received)</li>
            <li>Remove all matches and contact revelations</li>
          </ul>
          <p className="mt-2 text-xs text-muted">
            <strong>Note:</strong> Deletion is permanent. We may retain minimal anonymized data for legal/security purposes (e.g., blocked user IDs to prevent re-registration).
          </p>

          <h3 className="mt-4 font-semibold">6.4 Block Users</h3>
          <p>You can block any user. Once blocked, they cannot:</p>
          <ul className="ml-6 list-disc space-y-1">
            <li>See your partner listings</li>
            <li>Send you match requests</li>
            <li>View your profile</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-red">7. Data Retention</h2>
          <ul className="ml-6 list-disc space-y-2">
            <li><strong>Active Accounts:</strong> Data retained while your account is active</li>
            <li><strong>Deleted Accounts:</strong> All personal data permanently deleted within 30 days</li>
            <li><strong>Security Logs:</strong> May retain minimal security logs for up to 90 days</li>
            <li><strong>Reports:</strong> Reports of misconduct may be retained for safety purposes</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-red">8. Children's Privacy</h2>
          <p>
            Dandiya Match is <strong>only for users 18 years and older</strong>. We do not knowingly collect information from anyone under 18. If we discover that a minor has created an account, we will delete it immediately.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-red">9. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. Significant changes will be announced in the app. Continued use after changes means you accept the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-red">10. Contact Us</h2>
          <p>
            If you have questions about your privacy, data security, or how your information is used, please:
          </p>
          <ul className="ml-6 list-disc space-y-1">
            <li>Use the report feature in the app</li>
            <li>Open an issue on our GitHub repository</li>
            <li>Email us (contact details in the app)</li>
          </ul>
        </section>

        <div className="mt-8 rounded-xl border-2 border-orange bg-orange/5 p-6">
          <p className="text-center">
            <span className="text-2xl">🔒</span>
          </p>
          <p className="mt-2 text-center font-semibold">
            Your privacy and safety are our top priorities.
          </p>
          <p className="mt-2 text-center text-xs text-muted">
            We use industry-standard security practices and database-level protections to keep your contact information private until you choose to share it.
          </p>
        </div>
      </div>
    </main>
  );
}

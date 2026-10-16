"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { EmptyState, ErrorState } from "@/components/EmptyState";
import { PageSpinner } from "@/components/Spinner";
import { useToast } from "@/components/Toast";
import {
  useBlocks,
  useCurrentUser,
  useMyContacts,
  useMyProfile,
  useUnblockUser,
} from "@/lib/queries/profile";
import { createClient } from "@/lib/supabase/client";
import type { Experience, Gender } from "@/lib/types";
import { rpcErrorMessage } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const profileQ = useMyProfile();
  const contactsQ = useMyContacts();
  const blocksQ = useBlocks();
  const unblock = useUnblockUser();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState(18);
  const [gender, setGender] = useState<Gender>("female");
  const [experience, setExperience] = useState<Experience>("beginner");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (profileQ.data) {
      setDisplayName(profileQ.data.display_name);
      setAge(profileQ.data.age ?? 18);
      setGender(profileQ.data.gender ?? "female");
      setExperience(profileQ.data.experience ?? "beginner");
      setBio(profileQ.data.bio ?? "");
    }
  }, [profileQ.data]);

  useEffect(() => {
    if (contactsQ.data) {
      setPhone(contactsQ.data.phone ?? "");
      setInstagram(contactsQ.data.instagram ?? "");
    }
  }, [contactsQ.data]);

  if (profileQ.isLoading || contactsQ.isLoading) return <PageSpinner />;
  if (profileQ.isError) return <ErrorState onRetry={() => void profileQ.refetch()} />;

  async function save() {
    if (!user) return;
    if (age < 18) {
      toast("You must be 18 or older", "error");
      return;
    }
    if (!phone.trim() && !instagram.trim()) {
      toast("Add a phone number or Instagram", "error");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { error: pErr } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || "Dandiya Fan",
        age,
        gender,
        experience,
        bio: bio.trim() || null,
      })
      .eq("id", user.id);
    if (pErr) {
      toast(rpcErrorMessage(pErr), "error");
      setSaving(false);
      return;
    }
    const { error: cErr } = await supabase.from("profile_contacts").upsert({
      user_id: user.id,
      phone: phone.trim() || null,
      instagram: instagram.trim() || null,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (cErr) {
      toast(rpcErrorMessage(cErr), "error");
      return;
    }
    toast("Profile saved", "success");
    void profileQ.refetch();
    void contactsQ.refetch();
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  async function deleteAccount() {
    if (
      !confirm(
        "Delete your account and all listings, requests, and matches? This cannot be undone.",
      )
    ) {
      return;
    }
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.functions.invoke("delete-account", {
      method: "POST",
    });
    setDeleting(false);
    if (error) {
      toast(
        "Could not delete account. Make sure the delete-account Edge Function is deployed.",
        "error",
      );
      return;
    }
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-5">
      <div className="flex items-center gap-3">
        <Avatar
          name={profileQ.data?.display_name ?? "You"}
          src={profileQ.data?.avatar_url}
          size={56}
        />
        <div>
          <h1 className="font-display text-3xl text-red">Profile</h1>
          <p className="text-xs text-muted">
            Contact details are only shared after a mutual match.
          </p>
        </div>
      </div>

      <form
        className="mt-6 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <label className="block text-sm font-medium">
          Display name
          <input
            className={inputClass}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </label>
        <label className="block text-sm font-medium">
          Age
          <input
            type="number"
            min={18}
            max={80}
            className={inputClass}
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
          />
        </label>
        <label className="block text-sm font-medium">
          Gender
          <select
            className={inputClass}
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender)}
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="block text-sm font-medium">
          Experience
          <select
            className={inputClass}
            value={experience}
            onChange={(e) => setExperience(e.target.value as Experience)}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="pro">Pro</option>
          </select>
        </label>
        <label className="block text-sm font-medium">
          Bio
          <textarea
            maxLength={300}
            className={`${inputClass} min-h-24`}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </label>
        <label className="block text-sm font-medium">
          Phone
          <input
            className={inputClass}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
        <label className="block text-sm font-medium">
          Instagram
          <input
            className={inputClass}
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
          />
        </label>
        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </form>

      <h2 className="font-display mt-8 text-xl">Blocked</h2>
      {blocksQ.isLoading ? (
        <PageSpinner />
      ) : blocksQ.isError ? (
        <ErrorState onRetry={() => void blocksQ.refetch()} />
      ) : (blocksQ.data ?? []).length === 0 ? (
        <EmptyState title="No blocked users" />
      ) : (
        <ul className="mt-3 space-y-2">
          {(blocksQ.data ?? []).map((row) => (
            <li
              key={row.blocked_id}
              className="flex min-h-11 items-center justify-between rounded-2xl border border-line bg-card px-3 py-2"
            >
              <span>{row.blocked?.display_name ?? "User"}</span>
              <Button
                variant="secondary"
                disabled={unblock.isPending}
                onClick={async () => {
                  try {
                    await unblock.mutateAsync(row.blocked_id);
                    toast("Unblocked", "success");
                  } catch (err) {
                    toast(rpcErrorMessage(err), "error");
                  }
                }}
              >
                Unblock
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 space-y-3">
        <Button variant="secondary" className="w-full" onClick={() => void signOut()}>
          Sign out
        </Button>
        <Button
          variant="danger"
          className="w-full"
          disabled={deleting}
          onClick={() => void deleteAccount()}
        >
          {deleting ? "Deleting…" : "Delete my account"}
        </Button>
        <p className="text-center text-xs text-muted">
          <Link href="/terms" className="underline">
            Terms
          </Link>{" "}
          ·{" "}
          <Link href="/privacy" className="underline">
            Privacy
          </Link>
        </p>
      </div>
    </main>
  );
}

const inputClass =
  "mt-1 w-full min-h-11 rounded-xl border border-line bg-card px-3 text-sm";

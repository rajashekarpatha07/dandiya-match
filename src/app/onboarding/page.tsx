"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";
import { useMyProfile } from "@/lib/queries/profile";
import { createClient } from "@/lib/supabase/client";
import { rpcErrorMessage } from "@/lib/utils";

const schema = z
  .object({
    display_name: z.string().trim().min(2, "Add your name").max(50),
    age: z
      .number({ error: "Age is required" })
      .int()
      .min(18, "You must be 18 or older")
      .max(80),
    gender: z.enum(["male", "female", "other"]),
    experience: z.enum(["beginner", "intermediate", "pro"]),
    bio: z.string().max(300).optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    instagram: z.string().optional().or(z.literal("")),
    confirm18: z.boolean().refine((v) => v === true, {
      message: "Please confirm you are 18 or older",
    }),
  })
  .refine(
    (d) => Boolean(d.phone?.trim() || d.instagram?.trim()),
    {
      message: "Add a phone number or Instagram",
      path: ["phone"],
    },
  );

type FormValues = z.infer<typeof schema>;

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: profile } = useMyProfile();

  useEffect(() => {
    if (profile?.onboarded) router.replace("/");
  }, [profile, router]);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      display_name: "",
      age: 18,
      gender: "female",
      experience: "beginner",
      bio: "",
      phone: "",
      instagram: "",
      confirm18: false,
    },
  });

  async function onSubmit(values: FormValues) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/login");
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        display_name: values.display_name,
        age: values.age,
        gender: values.gender,
        experience: values.experience,
        bio: values.bio?.trim() || null,
        onboarded: true,
      })
      .eq("id", user.id);
    if (profileError) {
      toast(rpcErrorMessage(profileError), "error");
      return;
    }

    const { error: contactError } = await supabase
      .from("profile_contacts")
      .upsert({
        user_id: user.id,
        phone: values.phone?.trim() || null,
        instagram: values.instagram?.trim() || null,
        updated_at: new Date().toISOString(),
      });
    if (contactError) {
      toast(rpcErrorMessage(contactError), "error");
      return;
    }

    router.replace("/");
    router.refresh();
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <main className="mx-auto w-full max-w-md px-5 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-red">Set up your profile</h1>
        <button type="button" className="text-sm text-muted" onClick={() => void signOut()}>
          Sign out
        </button>
      </div>
      
      {/* Privacy Notice */}
      <div className="mt-4 rounded-2xl border-2 border-orange bg-orange/5 p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🔒</span>
          <div>
            <h2 className="font-semibold text-orange">Your Privacy is Protected</h2>
            <p className="mt-1 text-sm text-ink">
              Your phone number and Instagram are <strong>completely private</strong> until you and another person <strong>both accept</strong> a match. No one can see these details before that.
            </p>
          </div>
        </div>
      </div>
      
      <p className="mt-4 text-sm text-muted">
        Fill in your details below. Your contact information stays hidden until mutual match acceptance.
      </p>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Field label="Display name" error={errors.display_name?.message}>
          <input className={inputClass} {...register("display_name")} />
        </Field>
        <Field label="Age" error={errors.age?.message}>
          <input
            type="number"
            min={18}
            max={80}
            className={inputClass}
            {...register("age", { valueAsNumber: true })}
          />
        </Field>
        <Field label="Gender" error={errors.gender?.message}>
          <select className={inputClass} {...register("gender")}>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </Field>
        <Field label="Experience" error={errors.experience?.message}>
          <select className={inputClass} {...register("experience")}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="pro">Pro</option>
          </select>
        </Field>
        <Field label="Short bio (optional)" error={errors.bio?.message}>
          <textarea maxLength={300} className={`${inputClass} min-h-24`} {...register("bio")} />
        </Field>
        <Field label="Phone" error={errors.phone?.message}>
          <input className={inputClass} {...register("phone")} placeholder="10-digit mobile" />
          <p className="mt-1 text-xs text-muted">🔒 Only visible after mutual match acceptance</p>
        </Field>
        <Field label="Instagram" error={errors.instagram?.message}>
          <input className={inputClass} {...register("instagram")} placeholder="@handle" />
          <p className="mt-1 text-xs text-muted">🔒 Only visible after mutual match acceptance</p>
        </Field>
        
        <div className="rounded-xl border border-line bg-card p-4">
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" className="mt-1 h-5 w-5" {...register("confirm18")} />
            <span>
              I confirm that:
              <ul className="mt-2 space-y-1 text-xs text-muted">
                <li>• I am 18 years or older</li>
                <li>• I will meet only in public at the venue</li>
                <li>• I understand my contact details are private until mutual match</li>
                <li>• I agree to the <Link href="/terms" className="text-orange underline">Terms of Use</Link> and <Link href="/privacy" className="text-orange underline">Privacy Policy</Link></li>
              </ul>
            </span>
          </label>
        </div>
        {errors.confirm18 ? (
          <p className="text-sm text-red">{errors.confirm18.message}</p>
        ) : null}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Continue"}
        </Button>
      </form>
    </main>
  );
}

const inputClass =
  "w-full min-h-11 rounded-xl border border-line bg-card px-3 text-sm";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <div className="mt-1">{children}</div>
      {error ? <p className="mt-1 font-normal text-red">{error}</p> : null}
    </label>
  );
}

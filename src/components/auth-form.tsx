
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AuthFormProps = {
  mode: "signup" | "login";
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const isSignup = mode === "signup";

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setErrorMessage("");

    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName.trim(),
            },
            emailRedirectTo: `${window.location.origin}/auth/confirm`,
          },
        });

        if (error) throw error;

        if (data.session) {
          router.push("/dashboard");
          router.refresh();
          return;
        }

        setMessage(
          "Your account is almost ready! Check your email for a confirmation link."
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        router.push("/dashboard");
        router.refresh();
        return;
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <Link
        href="/"
        className="mb-10 inline-flex items-center gap-2 text-sm text-[#253D35]/65 hover:text-[#253D35]"
      >
        ← Back to home
      </Link>

      <div className="mb-8">
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#253D35] text-xl text-[#F7F3EA]">
          ✳
        </div>

        <h1 className="font-serif text-4xl tracking-tight text-[#253D35]">
          {isSignup ? "Create your account." : "Welcome back."}
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#253D35]/65">
          {isSignup
            ? "Your next discovery starts here. Create your own learning space."
            : "Pick up where your curiosity left off."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {isSignup && (
          <div>
            <label
              htmlFor="displayName"
              className="mb-2 block text-sm font-medium"
            >
              Your name
            </label>
            <input
              id="displayName"
              type="text"
              autoComplete="name"
              required
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="w-full rounded-xl border border-[#253D35]/15 bg-white px-4 py-3 outline-none transition focus:border-[#49675A] focus:ring-2 focus:ring-[#49675A]/15 text-[#253D35] placeholder:text-[#253D35]/40"
              placeholder="How should we call you?"
            />
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-[#253D35]/15 bg-white px-4 py-3 outline-none transition focus:border-[#49675A] focus:ring-2 focus:ring-[#49675A]/15 text-[#253D35] placeholder:text-[#253D35]/40" 
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-[#253D35]/15 bg-white px-4 py-3 outline-none transition focus:border-[#49675A] focus:ring-2 focus:ring-[#49675A]/15 text-[#253D35] placeholder:text-[#253D35]/40"
            placeholder="At least 8 characters"
          />
        </div>

        {errorMessage && (
          <p
            role="alert"
            className="rounded-xl bg-[#F1DFD2] px-4 py-3 text-sm text-[#914B3D]"
          >
            {errorMessage}
          </p>
        )}

        {message && (
          <p
            role="status"
            className="rounded-xl bg-[#DCE7DC] px-4 py-3 text-sm text-[#315B43]"
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-full bg-[#253D35] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#36564A] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Please wait..."
            : isSignup
              ? "Create account"
              : "Sign in"}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-[#253D35]/65">
        {isSignup ? "Already have an account?" : "New to wonderlearn?"}{" "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="font-semibold text-[#253D35] underline underline-offset-4"
        >
          {isSignup ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}

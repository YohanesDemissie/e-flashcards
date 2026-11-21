
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/sign-out-button";
import React from "react";

function DashboardLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F3EA] text-[#253D35]">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#253D35]/20 border-t-[#253D35]" />
        <p className="text-sm text-[#253D35]/65">
          Preparing your learning space...
        </p>
      </div>
    </main>
  );
}

async function DashboardContent() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    redirect("/login");
  }

  const email =
    typeof data.claims.email === "string"
      ? data.claims.email
      : "Curious learner";

  return (
    <main className="min-h-screen bg-[#F7F3EA] text-[#253D35]">
      <header className="border-b border-[#253D35]/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="/" className="text-xl font-semibold tracking-tight">
            wonder<span className="font-normal">learn</span>
          </a>

          <SignOutButton />
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <p className="text-xs font-semibold tracking-[0.2em] text-[#B47D45]">
          YOUR LEARNING SPACE
        </p>

        <h1 className="mt-4 font-serif text-5xl tracking-tight">
          Welcome back.
        </h1>

        <p className="mt-4 text-[#253D35]/65">
          Signed in as {email}
        </p>

        <div className="mt-12 rounded-3xl border border-[#253D35]/10 bg-white p-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#B47D45]">
            YOUR NEXT CHAPTER
          </p>

          <h2 className="mt-4 font-serif text-3xl">
            Your learning journey starts here.
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-7 text-[#253D35]/65">
            This is your personal learning space. Soon you'll be able to
            create decks, build flashcards, explore subjects, and study
            everything you're curious about.
          </p>
        </div>
      </section>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}

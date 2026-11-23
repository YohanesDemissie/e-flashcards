import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/sign-out-button";
import CreateDeckButton from "@/components/create-deck-button";
import { formatCreatedDate } from "@/lib/format-date";
import DeleteDeckButton from "@/components/delete-deck-button";

type Deck = {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  created_at: string;
};

function DashboardLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F3EA] text-[#253D35]">
      <p className="text-sm">Preparing your learning space...</p>
    </main>
  );
}

async function DashboardContent() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  if (error || typeof data?.claims?.sub !== "string") {
    redirect("/login");
  }

  const userId = data.claims.sub;
  const email =
    typeof data.claims.email === "string"
      ? data.claims.email
      : "Curious learner";

  const { data: deckData, error: deckError } = await supabase
    .from("decks")
    .select("id, title, description, subject, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const decks = (deckData ?? []) as Deck[];
  const subjects = new Set(decks.map((deck) => deck.subject));

  return (
    <main className="min-h-screen bg-[#F7F3EA] text-[#253D35]">
      {/* Top navigation */}
      <header className="sticky top-0 z-10 border-b border-[#253D35]/10 bg-[#F7F3EA]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-semibold tracking-tight">
            wonder<span className="font-normal">learn</span>
            <span className="ml-1 align-top text-xs text-[#B47D45]">✳</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-[#253D35]/60 sm:block">
              {email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[220px_1fr]">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <p className="mb-4 px-3 text-[11px] font-semibold tracking-[0.2em] text-[#253D35]/40">
            YOUR WORKSPACE
          </p>

          <nav className="flex gap-2 overflow-x-auto lg:flex-col">
            <a
              href="#overview"
              className="flex shrink-0 items-center gap-3 rounded-xl bg-[#253D35] px-4 py-3 text-sm font-medium text-white"
            >
              <span>⌂</span>
              Overview
            </a>

            <a
              href="#my-decks"
              className="flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#253D35]/70 transition hover:bg-white"
            >
              <span>▤</span>
              My decks
            </a>

            <a
              href="#study-tools"
              className="flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#253D35]/70 transition hover:bg-white"
            >
              <span>✳</span>
              Study tools
            </a>
          </nav>

          <div className="mt-10 hidden rounded-2xl bg-[#E9E5D9] p-5 lg:block">
            <span className="text-2xl">🌱</span>
            <p className="mt-3 font-serif text-lg">
              Small steps, big discoveries.
            </p>
            <p className="mt-2 text-xs leading-5 text-[#253D35]/60">
              Every new thing you learn is another step forward.
            </p>
          </div>
        </aside>

        {/* Main content */}
        <div className="min-w-0">
          <section id="overview" className="scroll-mt-28">
            <p className="text-xs font-semibold tracking-[0.2em] text-[#B47D45]">
              YOUR LEARNING SPACE
            </p>

            <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
                  Welcome back.
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[#253D35]/65">
                  Your curiosity has a home. Pick up where you left off or
                  explore something completely new.
                </p>
              </div>

              <a
                href="#my-decks"
                className="inline-flex w-fit items-center gap-2 rounded-full bg-[#253D35] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#36564A]"
              >
                Explore my decks <span>→</span>
              </a>
            </div>
          </section>

          {/* Overview statistics */}
          <section className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#253D35]/10 bg-white p-5">
              <p className="text-sm text-[#253D35]/55">Your decks</p>
              <p className="mt-2 font-serif text-3xl">
                {decks.length}
              </p>
              <p className="mt-1 text-xs text-[#253D35]/45">
                Personal learning collections
              </p>
            </div>

            <div className="rounded-2xl border border-[#253D35]/10 bg-white p-5">
              <p className="text-sm text-[#253D35]/55">Subjects explored</p>
              <p className="mt-2 font-serif text-3xl">
                {subjects.size}
              </p>
              <p className="mt-1 text-xs text-[#253D35]/45">
                Areas of curiosity
              </p>
            </div>

            <div className="rounded-2xl border border-[#253D35]/10 bg-[#E9E5D9] p-5">
              <p className="text-sm text-[#253D35]/55">Your next chapter</p>
              <p className="mt-2 font-serif text-2xl">
                Start learning
              </p>
              <p className="mt-1 text-xs text-[#253D35]/55">
                One card at a time.
              </p>
            </div>
          </section>

          {/* Deck collection */}
          <section id="my-decks" className="mt-14 scroll-mt-28">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-semibold tracking-[0.2em] text-[#B47D45]">
                    YOUR COLLECTION
                    </p>
                    <h2 className="mt-2 font-serif text-3xl">
                    My learning decks
                    </h2>
                </div>

                <CreateDeckButton />
            </div>

            {deckError ? (
              <div className="mt-6 rounded-2xl border border-[#D77F72]/30 bg-[#F1DFD2] p-6 text-sm text-[#914B3D]">
                We couldn't load your decks. Please refresh the page and try
                again.
              </div>
            ) : decks.length === 0 ? (
              <div className="mt-6 overflow-hidden rounded-3xl border border-dashed border-[#253D35]/20 bg-white px-6 py-14 text-center sm:px-12">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E9E5D9] text-3xl">
                  ✳
                </div>

                <h3 className="mt-6 font-serif text-2xl">
                  Your learning journey starts here.
                </h3>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#253D35]/60">
                  This is where your learning collections will live. Create
                  a deck for a subject you're curious about and start
                  turning new knowledge into something memorable.
                </p>

                <p className="mt-6 text-xs font-medium tracking-wide text-[#B47D45]">
                  YOUR FIRST DECK IS UP NEXT →
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                
                {decks.map((deck, index) => (
                    <div
                        key={deck.id}
                        className="rounded-2xl border border-[#253D35]/10 bg-white p-6 transition hover:-translate-y-1 hover:shadow-md"
                    >
                        <Link
                        href={`/dashboard/decks/${deck.id}`}
                        className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#49675A]"
                        >
                        <div className="flex items-center justify-between">
                            <span className="rounded-full bg-[#E9E5D9] px-3 py-1 text-xs font-medium text-[#253D35]/70">
                            {deck.subject}
                            </span>

                            <span className="text-lg text-[#B47D45]">
                            {["✳", "❋", "◇"][index % 3]}
                            </span>
                        </div>

                        <h3 className="mt-5 font-serif text-xl">
                            {deck.title}
                        </h3>

                        <p className="mt-2 min-h-10 text-sm leading-5 text-[#253D35]/60">
                            {deck.description || "A collection of things to learn."}
                        </p>

                        <p className="mt-5 border-t border-[#253D35]/10 pt-4 text-xs text-[#253D35]/45">
                            Created {formatCreatedDate(deck.created_at)}
                        </p>
                        </Link>

                        <DeleteDeckButton
                        deckId={deck.id}
                        deckTitle={deck.title}
                        />
                    </div>
                ))}

              </div>
            )}
          </section>

          {/* Future study tools */}
          <section
            id="study-tools"
            className="mt-14 scroll-mt-28 rounded-3xl bg-[#253D35] p-8 text-[#F7F3EA] sm:p-10"
          >
            <p className="text-xs font-semibold tracking-[0.2em] text-[#E6A65D]">
              COMING TO YOUR LEARNING SPACE
            </p>

            <h2 className="mt-4 max-w-lg font-serif text-3xl sm:text-4xl">
              More ways to make knowledge stick.
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-white/65">
              Interactive flashcards, personalized study sessions, and
              AI-powered learning tools are all part of the journey ahead.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full border border-white/20 px-4 py-2 text-xs">
                ✳ Smart flashcards
              </span>
              <span className="rounded-full border border-white/20 px-4 py-2 text-xs">
                ◇ Visual learning
              </span>
              <span className="rounded-full border border-white/20 px-4 py-2 text-xs">
                ↗ AI deck creation
              </span>
            </div>
          </section>
        </div>
      </div>
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

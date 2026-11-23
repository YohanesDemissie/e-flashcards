
import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/sign-out-button";
import { formatCreatedDate } from "@/lib/format-date";
import CreateFlashcardButton from "@/components/create-flashcard-button";
import StudyFlashcards from "@/components/study-flashcards";
import { connection } from "next/server";
import DeleteFlashcardButton from "@/components/delete-flashcard-button";

type DeckPageProps = {
  params: Promise<{ id: string }>;
};

function DeckLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F3EA] text-[#253D35]">
      <p className="text-sm">Opening your learning deck...</p>
    </main>
  );
}

// function formatCreatedDate(value: string) {
//   const monthNames = [
//     "Jan", "Feb", "Mar", "Apr",
//     "May", "Jun", "Jul", "Aug",
//     "Sep", "Oct", "Nov", "Dec",
//   ];

//   const [year, month, day] = value
//     .slice(0, 10)
//     .split("-");

//   return `${monthNames[Number(month) - 1]} ${Number(day)}, ${year}`;
// }

async function DeckContent({ params }: DeckPageProps) {
  await connection();

  const { id } = await params;
  const supabase = await createClient();

  // Verify the signed-in user.
  const { data: authData, error: authError } =
    await supabase.auth.getClaims();

  if (authError || typeof authData?.claims?.sub !== "string") {
    redirect("/login");
  }

  const userId = authData.claims.sub;

  // Retrieve only a deck owned by this user.
  const { data: deck, error: deckError } = await supabase
    .from("decks")
    .select("id, title, description, subject, created_at")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (deckError || !deck) {
    notFound();
  }

  // Retrieve flashcards belonging to this deck.
  const { data: cards, error: cardsError } = await supabase
    .from("flashcards")
    .select(
      "id, front_text, back_text, pronunciation, front_image_url, back_image_url, explanation, position, created_at"
    )
    .eq("deck_id", deck.id)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
      // Generate temporary signed URLs for private flashcard images.
  const imagePaths = (cards ?? []).flatMap((card) =>
    [card.front_image_url, card.back_image_url].filter(
      (path): path is string => Boolean(path)
    )
  );

  const signedUrlByPath = new Map<string, string>();

  if (imagePaths.length > 0) {
    const { data: signedImages, error: signedImagesError } =
      await supabase.storage
        .from("flashcard-images")
        .createSignedUrls(imagePaths, 60 * 60);

    if (signedImagesError) {
      console.error(
        "Failed to generate flashcard image URLs:",
        signedImagesError.message
      );
    } else {
      for (const image of signedImages ?? []) {
        if (image.path && image.signedUrl) {
          signedUrlByPath.set(image.path, image.signedUrl);
        }
      }
    }
  }

  // Give the UI signed URLs instead of private storage paths.
  const cardsWithSignedUrls = (cards ?? []).map((card) => ({
    ...card,
    front_image_url: card.front_image_url
      ? signedUrlByPath.get(card.front_image_url) ?? null
      : null,
    back_image_url: card.back_image_url
      ? signedUrlByPath.get(card.back_image_url) ?? null
      : null,
  }));
    const nextPosition = (cards?.reduce(
        (highest, card) => Math.max(highest, card.position),
        -1
    ) ?? -1) + 1;

  return (
    <main className="min-h-screen bg-[#F7F3EA] text-[#253D35]">
      {/* Navigation */}
      <header className="border-b border-[#253D35]/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-semibold tracking-tight">
            wonder<span className="font-normal">learn</span>
            <span className="ml-1 align-top text-xs text-[#B47D45]">✳</span>
          </Link>

          <SignOutButton />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-[#253D35]/60 transition hover:text-[#253D35]"
        >
          ← Back to my decks
        </Link>

        {/* Deck information */}
        <section className="mt-8 rounded-3xl bg-[#E9E5D9] p-7 sm:p-10">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#B47D45]">
            {deck.subject.toUpperCase()}
          </p>

          <h1 className="mt-4 max-w-3xl font-serif text-4xl tracking-tight sm:text-5xl">
            {deck.title}
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#253D35]/65">
            {deck.description || "Your personal learning collection."}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-white/70 px-4 py-2 text-xs font-medium">
              {cards?.length ?? 0}{" "}
              {(cards?.length ?? 0) === 1 ? "flashcard" : "flashcards"}
            </span>

            <span className="rounded-full bg-white/70 px-4 py-2 text-xs">
                Created {formatCreatedDate(deck.created_at)}
            </span>
          </div>
        </section>

        {/* Flashcard collection */}
        <section className="mt-12">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-[#B47D45]">
                YOUR COLLECTION
                </p>
                <h2 className="mt-2 font-serif text-3xl">
                Your flashcards
                </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-[#253D35]/50">
                    {cards?.length ?? 0} cards
                </span>

                <StudyFlashcards
                    deckTitle={deck.title}
                    cards={cardsWithSignedUrls}
                />

                <CreateFlashcardButton
                    deckId={deck.id}
                    nextPosition={nextPosition}
                />
            </div>
          </div>

          {cardsError ? (
            <div className="mt-6 rounded-2xl bg-[#F1DFD2] p-6 text-sm text-[#914B3D]">
              We couldn't load your flashcards. Please refresh and try again.
            </div>
          ) : cards && cards.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cardsWithSignedUrls.map((card, index) => (
                <article
                  key={card.id}
                  className="rounded-2xl border border-[#253D35]/10 bg-white p-6"
                >
                  <p className="text-xs font-semibold tracking-[0.15em] text-[#B47D45]">
                    CARD {index + 1}
                  </p>

                  <h3 className="mt-4 font-serif text-xl">
                    {card.front_text}
                  </h3>
                  {card.front_image_url && (
                <img
                    src={card.front_image_url}
                    alt={`Question image for ${card.front_text}`}
                    className="mt-4 max-h-56 w-full rounded-xl object-contain"
                />
                )}
                  <div className="my-5 border-t border-[#253D35]/10" />

                  <p className="text-xs font-semibold tracking-wide text-[#253D35]/45">
                    ANSWER
                  </p>

                 <p className="mt-2 text-sm leading-6 text-[#253D35]/75">
                    {card.back_text}
                </p>

                <DeleteFlashcardButton
                    cardId={card.id}
                    deckId={deck.id}
                  />
                  <DeleteFlashcardButton
                    cardId={card.id}
                    deckId={deck.id}
                    />
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-[#253D35]/20 bg-white px-6 py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E9E5D9] text-3xl">
                ✳
              </div>

              <h3 className="mt-6 font-serif text-2xl">
                Your first flashcard is waiting.
              </h3>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#253D35]/60">
                Start building your collection with questions, answers,
                and images that make learning memorable.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function DeckPage(props: DeckPageProps) {
  return (
    <Suspense fallback={<DeckLoading />}>
      <DeckContent {...props} />
    </Suspense>
  );
}

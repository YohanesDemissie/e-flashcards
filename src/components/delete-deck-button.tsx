
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { deleteFlashcardImages } from "@/lib/supabase/storage/flashcard-images";

type DeleteDeckButtonProps = {
  deckId: string;
  deckTitle: string;
};

export default function DeleteDeckButton({
  deckId,
  deckTitle,
}: DeleteDeckButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${deckTitle}" and all its flashcards? This cannot be undone.`
    );

    if (!confirmed) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      // Collect original Storage paths before deleting the deck.
      const { data: cards, error: cardsError } = await supabase
        .from("flashcards")
        .select("front_image_url, back_image_url")
        .eq("deck_id", deckId);

      if (cardsError) {
        throw new Error("Couldn't prepare the deck for deletion.");
      }

      const imagePaths = (cards ?? []).flatMap((card) =>
        [card.front_image_url, card.back_image_url].filter(
          (path): path is string => Boolean(path)
        )
      );

      // Delete only a deck owned by the authenticated user.
      // The database CASCADE removes its flashcard records.
      const { data: deletedDeck, error: deleteError } = await supabase
        .from("decks")
        .delete()
        .eq("id", deckId)
        .eq("user_id", user.id)
        .select("id")
        .maybeSingle();

      if (deleteError) {
        throw new Error(`Deck deletion failed: ${deleteError.message}`);
      }

      if (!deletedDeck) {
        throw new Error(
          "The deck could not be found or you don't have permission to delete it."
        );
      }

      // Storage cleanup happens after successful database deletion.
      try {
        await deleteFlashcardImages(imagePaths);
      } catch (cleanupError) {
        console.error("Deck image cleanup failed:", cleanupError);

        setErrorMessage(
          "Your deck was deleted, but some images couldn't be removed. Please refresh the dashboard."
        );
        return;
      }

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't delete this deck. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="rounded-full border border-[#D77F72]/30 px-3 py-1.5 text-xs font-medium text-[#914B3D] transition hover:bg-[#F1DFD2] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Deleting..." : "Delete deck"}
      </button>

      {errorMessage && (
        <p role="alert" className="mt-2 text-xs leading-5 text-[#914B3D]">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

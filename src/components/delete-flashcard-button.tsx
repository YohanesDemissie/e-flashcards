
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { deleteFlashcardImages } from "@/lib/supabase/storage/flashcard-images";

type DeleteFlashcardButtonProps = {
  cardId: string;
  deckId: string;
};

export default function DeleteFlashcardButton({
  cardId,
  deckId,
}: DeleteFlashcardButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      "Delete this flashcard and its associated images? This cannot be undone."
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

      // Retrieve original Storage paths before deleting the card.
      const { data: card, error: cardError } = await supabase
        .from("flashcards")
        .select("id, front_image_url, back_image_url")
        .eq("id", cardId)
        .eq("deck_id", deckId)
        .maybeSingle();

      if (cardError) {
        throw new Error("Couldn't prepare this flashcard for deletion.");
      }

      if (!card) {
        throw new Error("This flashcard could not be found.");
      }

      const imagePaths = [
        card.front_image_url,
        card.back_image_url,
      ].filter((path): path is string => Boolean(path));

      // Delete the database record first.
      const { data: deletedCard, error: deleteError } = await supabase
        .from("flashcards")
        .delete()
        .eq("id", cardId)
        .eq("deck_id", deckId)
        .select("id")
        .maybeSingle();

      if (deleteError) {
        throw new Error(`Flashcard deletion failed: ${deleteError.message}`);
      }

      if (!deletedCard) {
        throw new Error(
          "The flashcard could not be deleted. Please refresh and try again."
        );
      }

      // Clean up associated Storage objects.
      try {
        await deleteFlashcardImages(imagePaths);
      } catch (cleanupError) {
        console.error("Flashcard image cleanup failed:", cleanupError);

        window.alert(
          "Your flashcard was deleted, but some associated images couldn't be removed. The unused files may need cleanup later."
        );
      }

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't delete this flashcard. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-5 border-t border-[#253D35]/10 pt-4">
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="rounded-full border border-[#D77F72]/30 px-3 py-1.5 text-xs font-medium text-[#914B3D] transition hover:bg-[#F1DFD2] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Deleting..." : "Delete flashcard"}
      </button>

      {errorMessage && (
        <p role="alert" className="mt-2 text-xs leading-5 text-[#914B3D]">
          {errorMessage}
        </p>
      )}
    </div>
  );
}


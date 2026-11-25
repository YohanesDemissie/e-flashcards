
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ReorderCard = {
  id: string;
  front_text: string;
};

type ReorderFlashcardsButtonProps = {
  deckId: string;
  cards: ReorderCard[];
};

export default function ReorderFlashcardsButton({
  deckId,
  cards,
}: ReorderFlashcardsButtonProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [orderedCards, setOrderedCards] = useState<ReorderCard[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function openReorder() {
    setOrderedCards([...cards]);
    setErrorMessage("");
    setSuccessMessage("");
    setIsOpen(true);
  }

  function closeReorder() {
    if (loading) return;

    setIsOpen(false);
    setDraggedId(null);
    setErrorMessage("");
  }

  function moveCard(index: number, direction: -1 | 1) {
    const newIndex = index + direction;

    if (newIndex < 0 || newIndex >= orderedCards.length) {
      return;
    }

    setOrderedCards((current) => {
      const updated = [...current];
      [updated[index], updated[newIndex]] = [
        updated[newIndex],
        updated[index],
      ];
      return updated;
    });

    setSuccessMessage("");
  }

  function handleDrop(targetId: string) {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    setOrderedCards((current) => {
      const updated = [...current];
      const draggedIndex = updated.findIndex(
        (card) => card.id === draggedId
      );
      const targetIndex = updated.findIndex(
        (card) => card.id === targetId
      );

      if (draggedIndex === -1 || targetIndex === -1) {
        return current;
      }

      const [movedCard] = updated.splice(draggedIndex, 1);
      updated.splice(targetIndex, 0, movedCard);

      return updated;
    });

    setDraggedId(null);
    setSuccessMessage("");
  }

  async function saveOrder() {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const supabase = createClient();

      const { error } = await supabase.rpc("reorder_flashcards", {
        p_deck_id: deckId,
        p_card_ids: orderedCards.map((card) => card.id),
      });

      if (error) {
        throw new Error(error.message);
      }

      setIsOpen(false);
      setDraggedId(null);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Couldn't save your new card order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const hasChanges = orderedCards.some(
    (card, index) => card.id !== cards[index]?.id
  );

  if (cards.length < 2) return null;

  return (
    <>
      <button
        type="button"
        onClick={openReorder}
        className="inline-flex items-center gap-2 rounded-full border border-[#253D35]/20 px-5 py-3 text-sm font-medium text-[#253D35] transition hover:bg-white"
      >
        <span aria-hidden="true">↕</span>
        Reorder cards
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#17251F]/70 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reorder-title"
        >
          <div className="my-auto w-full max-w-xl rounded-3xl bg-[#F7F3EA] p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-[#B47D45]">
                  CUSTOMIZE YOUR DECK
                </p>
                <h2
                  id="reorder-title"
                  className="mt-2 font-serif text-2xl text-[#253D35] sm:text-3xl"
                >
                  Reorder your cards
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#253D35]/60">
                  Drag cards into your preferred order, or use the arrows.
                  Your saved order will also be used when studying normally.
                </p>
              </div>

              <button
                type="button"
                onClick={closeReorder}
                disabled={loading}
                aria-label="Close reorder dialog"
                className="rounded-full px-3 py-1 text-2xl text-[#253D35]/50 transition hover:bg-white hover:text-[#253D35] disabled:opacity-40"
              >
                ×
              </button>
            </div>

            <ol className="mt-6 max-h-[50vh] space-y-2 overflow-y-auto pr-1">
              {orderedCards.map((card, index) => (
                <li
                  key={card.id}
                  draggable={!loading}
                  onDragStart={() => setDraggedId(card.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handleDrop(card.id)}
                  onDragEnd={() => setDraggedId(null)}
                  className={`flex items-center gap-3 rounded-2xl border bg-white p-3 transition ${
                    draggedId === card.id
                      ? "border-[#49675A] opacity-40"
                      : "border-[#253D35]/10"
                  }`}
                >
                  <span className="w-7 shrink-0 text-center text-xs font-semibold text-[#B47D45]">
                    {index + 1}
                  </span>

                  <span
                    className="cursor-grab select-none text-[#253D35]/35 active:cursor-grabbing"
                    aria-hidden="true"
                    title="Drag to reorder"
                  >
                    ⠿
                  </span>

                  <span className="min-w-0 flex-1 break-words text-sm text-[#253D35]">
                    {card.front_text}
                  </span>

                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => moveCard(index, -1)}
                      disabled={loading || index === 0}
                      aria-label={`Move card ${index + 1} up`}
                      className="rounded-lg px-2 py-1 text-lg text-[#253D35]/65 transition hover:bg-[#E9E5D9] disabled:opacity-25"
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      onClick={() => moveCard(index, 1)}
                      disabled={loading || index === orderedCards.length - 1}
                      aria-label={`Move card ${index + 1} down`}
                      className="rounded-lg px-2 py-1 text-lg text-[#253D35]/65 transition hover:bg-[#E9E5D9] disabled:opacity-25"
                    >
                      ↓
                    </button>
                  </div>
                </li>
              ))}
            </ol>

            <p className="mt-4 text-xs leading-5 text-[#253D35]/50">
              This changes your saved deck order. Random study sessions
              won't change it.
            </p>

            {errorMessage && (
              <p
                role="alert"
                className="mt-4 rounded-xl bg-[#F1DFD2] p-3 text-sm text-[#914B3D]"
              >
                {errorMessage}
              </p>
            )}

            {successMessage && (
              <p className="mt-4 text-sm text-[#49675A]">
                {successMessage}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeReorder}
                disabled={loading}
                className="rounded-full border border-[#253D35]/20 px-6 py-3 text-sm font-medium text-[#253D35] transition hover:bg-white disabled:opacity-40"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveOrder}
                disabled={loading || !hasChanges}
                className="rounded-full bg-[#253D35] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#36564A] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? "Saving..." : "Save new order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

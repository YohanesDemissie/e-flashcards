
"use client";

import { useState } from "react";

type StudyCard = {
  id: string;
  front_text: string;
  back_text: string;
  pronunciation: string | null;
  explanation: string | null;
  front_image_url: string | null;
  back_image_url: string | null;
};

type StudyFlashcardsProps = {
  deckTitle: string;
  cards: StudyCard[];
};

export default function StudyFlashcards({
  deckTitle,
  cards,
}: StudyFlashcardsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  function closeStudyMode() {
    setIsOpen(false);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsComplete(false);
  }

  function goToNextCard() {
    setIsFlipped(false);

    if (currentIndex === cards.length - 1) {
      setIsComplete(true);
      return;
    }

    setCurrentIndex((current) => current + 1);
  }

  function goToPreviousCard() {
    if (currentIndex === 0) return;

    setCurrentIndex((current) => current - 1);
    setIsFlipped(false);
  }

  function restartStudy() {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsComplete(false);
  }

  const currentCard = cards[currentIndex];
  const progress = cards.length
    ? ((currentIndex + 1) / cards.length) * 100
    : 0;

  return (
    <>
      <button
        type="button"
        disabled={cards.length === 0}
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-[#253D35]/20 px-5 py-3 text-sm font-medium text-[#253D35] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span>↻</span>
        Study deck
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#17251F]/70 px-4 py-8 backdrop-blur-sm">
          <div className="my-auto w-full max-w-2xl rounded-3xl bg-[#F7F3EA] p-6 shadow-2xl sm:p-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-[#B47D45]">
                  STUDY SESSION
                </p>
                <h2 className="mt-2 font-serif text-2xl text-[#253D35] sm:text-3xl">
                  {deckTitle}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeStudyMode}
                aria-label="Close study mode"
                className="rounded-full px-3 py-1 text-2xl text-[#253D35]/50 transition hover:bg-white hover:text-[#253D35]"
              >
                ×
              </button>
            </div>

            {isComplete ? (
              <div className="py-14 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#E9E5D9] text-4xl">
                  ✳
                </div>

                <h3 className="mt-7 font-serif text-3xl text-[#253D35]">
                  Session complete!
                </h3>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#253D35]/60">
                  You've made it through all {cards.length}{" "}
                  {cards.length === 1 ? "card" : "cards"} in this deck.
                  Every review is another step toward remembering.
                </p>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={restartStudy}
                    className="rounded-full bg-[#253D35] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#36564A]"
                  >
                    Study again ↻
                  </button>

                  <button
                    type="button"
                    onClick={closeStudyMode}
                    className="rounded-full border border-[#253D35]/20 px-6 py-3 text-sm font-medium text-[#253D35] transition hover:bg-white"
                  >
                    Finish
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-8 flex items-center justify-between text-xs text-[#253D35]/55">
                  <span>
                    CARD {currentIndex + 1} OF {cards.length}
                  </span>
                  <span>{Math.round(progress)}% through</span>
                </div>

                <div
                  className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#253D35]/10"
                  role="progressbar"
                  aria-label="Study progress"
                  aria-valuemin={0}
                  aria-valuemax={cards.length}
                  aria-valuenow={currentIndex + 1}
                >
                  <div
                    className="h-full rounded-full bg-[#49675A] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setIsFlipped((flipped) => !flipped)}
                  aria-label={
                    isFlipped
                      ? "Show question"
                      : "Reveal answer"
                  }
                  className="group mt-7 flex min-h-[300px] w-full flex-col items-center justify-center rounded-3xl border border-[#253D35]/10 bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:min-h-[340px] sm:p-12"
                >
                  <span className="text-xs font-semibold tracking-[0.2em] text-[#B47D45]">
                    {isFlipped ? "ANSWER" : "QUESTION"}
                  </span>

                  <span className="mt-7 max-w-lg font-serif text-3xl leading-tight text-[#253D35] sm:text-4xl">
                    {isFlipped
                        ? currentCard.back_text
                        : currentCard.front_text}
                    </span>

                    {(isFlipped
                    ? currentCard.back_image_url
                    : currentCard.front_image_url) && (
                    <img
                        src={
                        isFlipped
                            ? currentCard.back_image_url!
                            : currentCard.front_image_url!
                        }
                        alt={
                        isFlipped
                            ? `Answer image for ${currentCard.back_text}`
                            : `Question image for ${currentCard.front_text}`
                        }
                        className="mt-6 max-h-64 w-full max-w-sm rounded-2xl object-contain"
                    />
                    )}

                  {isFlipped && currentCard.pronunciation && (
                    <span className="mt-5 text-sm text-[#49675A]">
                      Pronunciation: {currentCard.pronunciation}
                    </span>
                  )}

                  {isFlipped && currentCard.explanation && (
                    <span className="mt-5 max-w-lg rounded-2xl bg-[#E9E5D9] p-4 text-sm leading-6 text-[#253D35]/75">
                      {currentCard.explanation}
                    </span>
                  )}

                  <span className="mt-8 text-xs text-[#253D35]/40 transition group-hover:text-[#253D35]/70">
                    Click to {isFlipped ? "see question" : "reveal answer"} ↻
                  </span>
                </button>

                <div className="mt-7 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={goToPreviousCard}
                    disabled={currentIndex === 0}
                    className="rounded-full border border-[#253D35]/20 px-5 py-3 text-sm font-medium text-[#253D35] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    ← Previous
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsFlipped((flipped) => !flipped)}
                    className="rounded-full border border-[#253D35]/20 px-5 py-3 text-sm font-medium text-[#253D35] transition hover:bg-white"
                  >
                    Flip card ↻
                  </button>

                  <button
                    type="button"
                    onClick={goToNextCard}
                    className="rounded-full bg-[#253D35] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#36564A]"
                  >
                    {currentIndex === cards.length - 1
                      ? "Finish →"
                      : "Next →"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

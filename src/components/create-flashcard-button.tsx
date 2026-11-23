
"use client";

import {
  useState,
  useEffect,
  type FormEvent,
  type ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { uploadFlashcardImage } from "@/lib/supabase/storage/flashcard-images";

type CreateFlashcardButtonProps = {
  deckId: string;
  nextPosition: number;
};

type ImageSide = "front" | "back";

function ImagePreview({
  file,
  alt,
}: {
  file: File;
  alt: string;
}) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    const url = URL.createObjectURL(file);

    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  if (!previewUrl) {
    return (
      <div className="h-20 w-20 animate-pulse rounded-lg bg-[#253D35]/10" />
    );
  }

  return (
    <img
      src={previewUrl}
      alt={alt}
      className="h-20 w-20 rounded-lg object-cover"
    />
  );
}

export default function CreateFlashcardButton({
  deckId,
  nextPosition,
}: CreateFlashcardButtonProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [frontText, setFrontText] = useState("");
  const [backText, setBackText] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [explanation, setExplanation] = useState("");

  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function resetForm() {
    setFrontText("");
    setBackText("");
    setPronunciation("");
    setExplanation("");
    setFrontImage(null);
    setBackImage(null);
    setErrorMessage("");
  }

  function handleImageChange(
  event: ChangeEvent<HTMLInputElement>,
  side: ImageSide
) {
  const file = event.target.files?.[0] ?? null;

  if (!file) return;

  // Allow the same file to be selected again later.
  event.target.value = "";

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("Please select a JPEG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Images must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    setErrorMessage("");

    if (side === "front") {
      setFrontImage(file);
    } else {
      setBackImage(file);
    }
  }

  function removeImage(side: ImageSide) {
    if (side === "front") {
      setFrontImage(null);
    } else {
      setBackImage(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!frontText.trim() || !backText.trim()) {
      setErrorMessage(
        "Please enter both the front and back of your card."
      );
      return;
    }

    setLoading(true);

    const supabase = createClient();

    let createdCardId: string | null = null;
    const uploadedPaths: string[] = [];

    try {
      const {
        data: userData,
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        throw new Error(
          "Your session has expired. Please sign in again."
        );
      }

      // 1. Create the flashcard and obtain its UUID.
      const {
        data: card,
        error: insertError,
      } = await supabase
        .from("flashcards")
        .insert({
          deck_id: deckId,
          front_text: frontText.trim(),
          back_text: backText.trim(),
          pronunciation: pronunciation.trim() || null,
          explanation: explanation.trim() || null,
          position: nextPosition,
        })
        .select("id")
        .single();

      if (insertError || !card) {
        throw insertError ?? new Error(
          "We couldn't create your flashcard."
        );
      }

      createdCardId = card.id;

      // 2. Upload selected images using the new card UUID.
      let frontImagePath: string | null = null;
      let backImagePath: string | null = null;

      if (frontImage) {
        frontImagePath = await uploadFlashcardImage({
          file: frontImage,
          deckId,
          cardId: card.id,
          side: "front",
        });

        uploadedPaths.push(frontImagePath);
      }

      if (backImage) {
        backImagePath = await uploadFlashcardImage({
          file: backImage,
          deckId,
          cardId: card.id,
          side: "back",
        });

        uploadedPaths.push(backImagePath);
      }

      // 3. Save the Storage paths on the flashcard record.
      if (frontImagePath || backImagePath) {
        const { error: updateError } = await supabase
          .from("flashcards")
          .update({
            front_image_url: frontImagePath,
            back_image_url: backImagePath,
          })
          .eq("id", card.id)
          .eq("deck_id", deckId);

        if (updateError) {
          throw updateError;
        }
      }

      resetForm();
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      // 4. Clean up uploaded files and the incomplete card.
      if (uploadedPaths.length > 0) {
        await supabase.storage
          .from("flashcard-images")
          .remove(uploadedPaths);
      }

      if (createdCardId) {
        await supabase
          .from("flashcards")
          .delete()
          .eq("id", createdCardId)
          .eq("deck_id", deckId);
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't create your flashcard. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function renderImageField(side: ImageSide) {
    const image = side === "front" ? frontImage : backImage;
    const inputId = `${side}-image`;

    return (
      <div>
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-medium text-[#253D35]"
        >
          {side === "front" ? "Front image" : "Back image"}{" "}
          <span className="font-normal text-[#253D35]/45">
            (optional)
          </span>
        </label>

        {image ? (
          <div className="rounded-xl border border-[#253D35]/15 bg-white p-3">
            <div className="flex items-center gap-3">
              <ImagePreview
                file={image}
                alt={`${side} image preview`}
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#253D35]">
                  {image.name}
                </p>
                <p className="mt-1 text-xs text-[#253D35]/50">
                  {(image.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              <button
                type="button"
                onClick={() => removeImage(side)}
                disabled={loading}
                className="rounded-full px-3 py-2 text-sm text-[#914B3D] transition hover:bg-[#F1DFD2] disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <label
            htmlFor={inputId}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#253D35]/25 bg-white/70 px-4 py-5 text-center transition hover:border-[#49675A] hover:bg-white"
          >
            <span className="text-2xl text-[#49675A]">＋</span>
            <span className="mt-1 text-sm font-medium text-[#253D35]">
              Choose an image
            </span>
            <span className="mt-1 text-xs text-[#253D35]/45">
              JPEG, PNG, or WebP · Up to 5 MB
            </span>
          </label>
        )}

        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => handleImageChange(event, side)}
          disabled={loading}
          className="sr-only"
        />

        {image && (
          <label
            htmlFor={inputId}
            className="mt-2 inline-block cursor-pointer text-xs font-medium text-[#49675A] hover:underline"
          >
            Replace image
          </label>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          resetForm();
          setIsOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-full bg-[#253D35] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#36564A]"
      >
        <span className="text-lg leading-none">+</span>
        Create flashcard
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#17251F]/50 px-4 py-8 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !loading
            ) {
              setIsOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-flashcard-title"
            className="my-auto w-full max-w-xl rounded-3xl bg-[#F7F3EA] p-7 shadow-2xl sm:p-9"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-[#B47D45]">
                  BUILD YOUR KNOWLEDGE
                </p>

                <h2
                  id="create-flashcard-title"
                  className="mt-2 font-serif text-3xl text-[#253D35]"
                >
                  Create a flashcard.
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#253D35]/60">
                  Add a question, an answer, and anything that helps you
                  remember.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={loading}
                aria-label="Close"
                className="rounded-full px-3 py-1 text-2xl text-[#253D35]/50 transition hover:bg-white hover:text-[#253D35] disabled:opacity-40"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="front-text"
                  className="mb-2 block text-sm font-medium text-[#253D35]"
                >
                  Front of card
                </label>

                <textarea
                  id="front-text"
                  value={frontText}
                  onChange={(event) => setFrontText(event.target.value)}
                  required
                  maxLength={1000}
                  rows={3}
                  placeholder="Enter a question, word, or concept..."
                  className="w-full resize-none rounded-xl border border-[#253D35]/15 bg-white px-4 py-3 text-sm text-[#253D35] outline-none transition placeholder:text-[#253D35]/40 focus:border-[#49675A] focus:ring-2 focus:ring-[#49675A]/15"
                />
              </div>

              {renderImageField("front")}

              <div>
                <label
                  htmlFor="back-text"
                  className="mb-2 block text-sm font-medium text-[#253D35]"
                >
                  Back of card
                </label>

                <textarea
                  id="back-text"
                  value={backText}
                  onChange={(event) => setBackText(event.target.value)}
                  required
                  maxLength={3000}
                  rows={3}
                  placeholder="Enter the answer or definition..."
                  className="w-full resize-none rounded-xl border border-[#253D35]/15 bg-white px-4 py-3 text-sm text-[#253D35] outline-none transition placeholder:text-[#253D35]/40 focus:border-[#49675A] focus:ring-2 focus:ring-[#49675A]/15"
                />
              </div>

              {renderImageField("back")}

              <div>
                <label
                  htmlFor="pronunciation"
                  className="mb-2 block text-sm font-medium text-[#253D35]"
                >
                  Pronunciation{" "}
                  <span className="font-normal text-[#253D35]/45">
                    (optional)
                  </span>
                </label>

                <input
                  id="pronunciation"
                  value={pronunciation}
                  onChange={(event) => setPronunciation(event.target.value)}
                  maxLength={255}
                  placeholder="e.g. joo-pi-ter"
                  className="w-full rounded-xl border border-[#253D35]/15 bg-white px-4 py-3 text-sm text-[#253D35] outline-none transition placeholder:text-[#253D35]/40 focus:border-[#49675A] focus:ring-2 focus:ring-[#49675A]/15"
                />
              </div>

              <div>
                <label
                  htmlFor="explanation"
                  className="mb-2 block text-sm font-medium text-[#253D35]"
                >
                  Additional explanation{" "}
                  <span className="font-normal text-[#253D35]/45">
                    (optional)
                  </span>
                </label>

                <textarea
                  id="explanation"
                  value={explanation}
                  onChange={(event) => setExplanation(event.target.value)}
                  maxLength={3000}
                  rows={2}
                  placeholder="Add a helpful example, memory tip, or extra detail..."
                  className="w-full resize-none rounded-xl border border-[#253D35]/15 bg-white px-4 py-3 text-sm text-[#253D35] outline-none transition placeholder:text-[#253D35]/40 focus:border-[#49675A] focus:ring-2 focus:ring-[#49675A]/15"
                />
              </div>

              <p className="text-xs leading-5 text-[#253D35]/50">
                Images are stored privately and attached to your flashcard.
                You can add an image to either side or both sides.
              </p>

              {errorMessage && (
                <p
                  role="alert"
                  className="rounded-xl bg-[#F1DFD2] px-4 py-3 text-sm text-[#914B3D]"
                >
                  {errorMessage}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setIsOpen(false)}
                  className="rounded-full border border-[#253D35]/20 px-6 py-3 text-sm font-medium text-[#253D35] transition hover:bg-white disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-[#253D35] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#36564A] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Saving..." : "Save flashcard →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

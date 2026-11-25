
"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { uploadFlashcardImage } from "@/lib/supabase/storage/flashcard-images";
import { deleteFlashcardImages } from "@/lib/supabase/storage/flashcard-images";

type ImageSide = "front" | "back";

type EditFlashcardButtonProps = {
  cardId: string;
  deckId: string;
  frontText: string;
  backText: string;
  pronunciation: string | null;
  explanation: string | null;
  frontImageUrl: string | null;
  backImageUrl: string | null;
};

function ImagePreview({
  file,
  existingUrl,
  label,
}: {
  file: File | null;
  existingUrl: string | null;
  label: string;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const src = previewUrl ?? existingUrl;

  if (!src) return null;

  return (
    <div className="mt-3">
      <p className="mb-2 text-xs font-medium text-[#52685E]">{label}</p>
      <img
        src={src}
        alt={label}
        className="max-h-40 max-w-full rounded-xl border border-[#253D35]/10 object-contain"
      />
    </div>
  );
}

export default function EditFlashcardButton({
  cardId,
  deckId,
  frontText: initialFrontText,
  backText: initialBackText,
  pronunciation: initialPronunciation,
  explanation: initialExplanation,
  frontImageUrl,
  backImageUrl,
}: EditFlashcardButtonProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [frontText, setFrontText] = useState(initialFrontText);
  const [backText, setBackText] = useState(initialBackText);
  const [pronunciation, setPronunciation] = useState(
    initialPronunciation ?? ""
  );
  const [explanation, setExplanation] = useState(initialExplanation ?? "");

  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [removeFrontImage, setRemoveFrontImage] = useState(false);
  const [removeBackImage, setRemoveBackImage] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
    side: ImageSide
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("Please choose a JPEG, PNG, or WebP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Images must be 5 MB or smaller.");
      return;
    }

    setErrorMessage("");

    if (side === "front") {
      setFrontImage(file);
      setRemoveFrontImage(false);
    } else {
      setBackImage(file);
      setRemoveBackImage(false);
    }
  }

  function removeImage(side: ImageSide) {
    if (side === "front") {
      setFrontImage(null);
      setRemoveFrontImage(true);
    } else {
      setBackImage(null);
      setRemoveBackImage(true);
    }
  }

  function closeModal() {
    if (loading) return;
    setIsOpen(false);
    setErrorMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!frontText.trim() || !backText.trim()) {
      setErrorMessage("Both the front and answer fields are required.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const uploadedPaths: string[] = [];

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      // Fetch the current image paths directly from the database.
      const { data: currentCard, error: fetchError } = await supabase
        .from("flashcards")
        .select("id, front_image_url, back_image_url")
        .eq("id", cardId)
        .eq("deck_id", deckId)
        .maybeSingle();

      if (fetchError) {
        throw new Error("We couldn't load the current flashcard.");
      }

      if (!currentCard) {
        throw new Error("This flashcard could not be found.");
      }

      let nextFrontPath = removeFrontImage
        ? null
        : currentCard.front_image_url;

      let nextBackPath = removeBackImage
        ? null
        : currentCard.back_image_url;

      // Upload replacements before changing the database record.
      if (frontImage) {
        nextFrontPath = await uploadFlashcardImage({
          file: frontImage,
          deckId,
          cardId,
          side: "front",
        });
        uploadedPaths.push(nextFrontPath);
      }

      if (backImage) {
        nextBackPath = await uploadFlashcardImage({
          file: backImage,
          deckId,
          cardId,
          side: "back",
        });
        uploadedPaths.push(nextBackPath);
      }

      const { data: updatedCard, error: updateError } = await supabase
        .from("flashcards")
        .update({
          front_text: frontText.trim(),
          back_text: backText.trim(),
          pronunciation: pronunciation.trim() || null,
          explanation: explanation.trim() || null,
          front_image_url: nextFrontPath,
          back_image_url: nextBackPath,
        })
        .eq("id", cardId)
        .eq("deck_id", deckId)
        .select("id")
        .maybeSingle();

      if (updateError) {
        throw new Error(`Flashcard update failed: ${updateError.message}`);
      }

      if (!updatedCard) {
        throw new Error(
          "The flashcard wasn't updated. Please refresh and try again."
        );
      }

      // The database now references the new paths.
      // Remove old images only after the update succeeds.
      const oldPathsToDelete = [
        currentCard.front_image_url !== nextFrontPath
            ? currentCard.front_image_url
            : null,
        currentCard.back_image_url !== nextBackPath
            ? currentCard.back_image_url
            : null,
        ].filter((path): path is string => Boolean(path));

      try {
        await deleteFlashcardImages(oldPathsToDelete);
      } catch (cleanupError) {
        console.error("Old flashcard image cleanup failed:", cleanupError);
        window.alert(
          "Your flashcard was updated, but an old image couldn't be removed. The unused file may need cleanup later."
        );
      }

      setIsOpen(false);
      router.refresh();
    } catch (error) {
      // If the database update failed, remove any newly uploaded images.
      if (uploadedPaths.length > 0) {
        try {
          await deleteFlashcardImages(uploadedPaths);
        } catch (cleanupError) {
          console.error("New image cleanup failed:", cleanupError);
        }
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't update this flashcard. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-full border border-[#253D35]/15 px-3 py-1.5 text-xs font-medium text-[#253D35] transition hover:bg-[#E8EEE9]"
      >
        Edit flashcard
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-flashcard-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-[#FAF9F6] p-6 shadow-xl sm:p-8"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A9A8F]">
                  Flashcard
                </p>
                <h2
                  id="edit-flashcard-title"
                  className="mt-1 text-2xl font-semibold text-[#253D35]"
                >
                  Edit flashcard
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                aria-label="Close edit form"
                className="rounded-full px-3 py-2 text-xl text-[#52685E] transition hover:bg-[#E8EEE9] disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor={`edit-front-${cardId}`}
                  className="mb-2 block text-sm font-medium text-[#253D35]"
                >
                  Front
                </label>
                <textarea
                  id={`edit-front-${cardId}`}
                  required
                  maxLength={1000}
                  rows={3}
                  value={frontText}
                  onChange={(event) => setFrontText(event.target.value)}
                  className="w-full rounded-2xl border border-[#253D35]/15 bg-white px-4 py-3 text-sm text-[#253D35] outline-none focus:border-[#78917F]"
                />

                <div className="mt-3">
                  <label className="mb-2 block text-sm font-medium text-[#253D35]">
                    Front image
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => handleImageChange(event, "front")}
                    className="block w-full text-sm text-[#52685E] file:mr-3 file:rounded-full file:border-0 file:bg-[#E8EEE9] file:px-4 file:py-2 file:text-xs file:font-medium file:text-[#253D35]"
                  />
                  {!removeFrontImage && (
                    <ImagePreview
                      file={frontImage}
                      existingUrl={frontImageUrl}
                      label="Front image preview"
                    />
                  )}
                  {(frontImage || (frontImageUrl && !removeFrontImage)) && (
                    <button
                      type="button"
                      onClick={() => removeImage("front")}
                      className="mt-2 text-xs font-medium text-[#914B3D] underline"
                    >
                      Remove front image
                    </button>
                  )}
                  {removeFrontImage && (
                    <p className="mt-2 text-xs text-[#914B3D]">
                      Front image will be removed when you save.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor={`edit-back-${cardId}`}
                  className="mb-2 block text-sm font-medium text-[#253D35]"
                >
                  Answer
                </label>
                <textarea
                  id={`edit-back-${cardId}`}
                  required
                  maxLength={3000}
                  rows={4}
                  value={backText}
                  onChange={(event) => setBackText(event.target.value)}
                  className="w-full rounded-2xl border border-[#253D35]/15 bg-white px-4 py-3 text-sm text-[#253D35] outline-none focus:border-[#78917F]"
                />

                <div className="mt-3">
                  <label className="mb-2 block text-sm font-medium text-[#253D35]">
                    Answer image
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => handleImageChange(event, "back")}
                    className="block w-full text-sm text-[#52685E] file:mr-3 file:rounded-full file:border-0 file:bg-[#E8EEE9] file:px-4 file:py-2 file:text-xs file:font-medium file:text-[#253D35]"
                  />
                  {!removeBackImage && (
                    <ImagePreview
                      file={backImage}
                      existingUrl={backImageUrl}
                      label="Answer image preview"
                    />
                  )}
                  {(backImage || (backImageUrl && !removeBackImage)) && (
                    <button
                      type="button"
                      onClick={() => removeImage("back")}
                      className="mt-2 text-xs font-medium text-[#914B3D] underline"
                    >
                      Remove answer image
                    </button>
                  )}
                  {removeBackImage && (
                    <p className="mt-2 text-xs text-[#914B3D]">
                      Answer image will be removed when you save.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor={`edit-pronunciation-${cardId}`}
                  className="mb-2 block text-sm font-medium text-[#253D35]"
                >
                  Pronunciation
                </label>
                <input
                  id={`edit-pronunciation-${cardId}`}
                  maxLength={255}
                  value={pronunciation}
                  onChange={(event) => setPronunciation(event.target.value)}
                  className="w-full rounded-2xl border border-[#253D35]/15 bg-white px-4 py-3 text-sm text-[#253D35] outline-none focus:border-[#78917F]"
                />
              </div>

              <div>
                <label
                  htmlFor={`edit-explanation-${cardId}`}
                  className="mb-2 block text-sm font-medium text-[#253D35]"
                >
                  Explanation
                </label>
                <textarea
                  id={`edit-explanation-${cardId}`}
                  maxLength={3000}
                  rows={3}
                  value={explanation}
                  onChange={(event) => setExplanation(event.target.value)}
                  className="w-full rounded-2xl border border-[#253D35]/15 bg-white px-4 py-3 text-sm text-[#253D35] outline-none focus:border-[#78917F]"
                />
              </div>

              {errorMessage && (
                <p role="alert" className="text-sm text-[#914B3D]">
                  {errorMessage}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-[#253D35]/10 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  className="rounded-full border border-[#253D35]/15 px-5 py-2.5 text-sm font-medium text-[#52685E] transition hover:bg-[#E8EEE9] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-[#253D35] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#3C594B] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Saving changes..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}


"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const subjects = [
  "Languages",
  "Science",
  "Mathematics",
  "History",
  "Geography",
  "Technology",
  "Arts",
  "Business",
  "General",
  "Other",
];

export default function CreateDeckButton() {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("General");
  const [customSubject, setCustomSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  function resetForm() {
  setTitle("");
  setDescription("");
  setSubject("General");
  setCustomSubject("");
  setErrorMessage("");
}

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");

    const finalSubject =
      subject === "Other" ? customSubject.trim() : subject;

    if (!title.trim()) {
      setErrorMessage("Please enter a deck title.");
      return;
    }

    if (!finalSubject) {
      setErrorMessage("Please enter a subject.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const { error: insertError } = await supabase
        .from("decks")
        .insert({
          user_id: userData.user.id,
          title: title.trim(),
          description: description.trim() || null,
          subject: finalSubject,
        });

      if (insertError) {
        throw insertError;
      }

      resetForm();
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't create your deck. Please try again."
      );
    } finally {
      setLoading(false);
    }
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
        Create a deck
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#17251F]/50 px-4 py-8 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !loading) {
              setIsOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-deck-title"
            className="w-full max-w-lg rounded-3xl bg-[#F7F3EA] p-7 shadow-2xl sm:p-9"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-[#B47D45]">
                  A NEW CHAPTER
                </p>
                <h2
                  id="create-deck-title"
                  className="mt-2 font-serif text-3xl text-[#253D35]"
                >
                  Create a learning deck.
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#253D35]/60">
                  Give your next learning adventure a home.
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
                  htmlFor="deck-title"
                  className="mb-2 block text-sm font-medium text-[#253D35]"
                >
                  Deck title
                </label>
                <input
                  id="deck-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                  maxLength={100}
                  placeholder="e.g. Spanish vocabulary"
                  className="w-full rounded-xl border border-[#253D35]/15 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#253D35]/35 focus:border-[#49675A] focus:ring-2 focus:ring-[#49675A]/15"
                />
              </div>

              <div>
                <label
                  htmlFor="deck-subject"
                  className="mb-2 block text-sm font-medium text-[#253D35]"
                >
                  Subject
                </label>
                <select
                  id="deck-subject"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  className="w-full rounded-xl border border-[#253D35]/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#49675A] focus:ring-2 focus:ring-[#49675A]/15"
                >
                  {subjects.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {subject === "Other" && (
                <div>
                  <label
                    htmlFor="custom-subject"
                    className="mb-2 block text-sm font-medium text-[#253D35]"
                  >
                    Your subject
                  </label>
                  <input
                    id="custom-subject"
                    value={customSubject}
                    onChange={(event) =>
                      setCustomSubject(event.target.value)
                    }
                    maxLength={50}
                    required
                    placeholder="e.g. Photography"
                    className="w-full rounded-xl border border-[#253D35]/15 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#253D35]/35 focus:border-[#49675A] focus:ring-2 focus:ring-[#49675A]/15"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="deck-description"
                  className="mb-2 block text-sm font-medium text-[#253D35]"
                >
                  Description <span className="font-normal text-[#253D35]/45">(optional)</span>
                </label>
                <textarea
                  id="deck-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="What would you like to learn?"
                  className="w-full resize-none rounded-xl border border-[#253D35]/15 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#253D35]/35 focus:border-[#49675A] focus:ring-2 focus:ring-[#49675A]/15"
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
                  {loading ? "Creating..." : "Create deck →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}


import { createClient } from "@/lib/supabase/client";

const BUCKET_NAME = "flashcard-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

type ImageSide = "front" | "back";

type UploadFlashcardImageParams = {
  file: File;
  deckId: string;
  cardId: string;
  side: ImageSide;
};

export async function uploadFlashcardImage({
  file,
  deckId,
  cardId,
  side,
}: UploadFlashcardImageParams): Promise<string> {
  if (
    !ALLOWED_TYPES.includes(
      file.type as (typeof ALLOWED_TYPES)[number]
    )
  ) {
    throw new Error(
      "Please select a JPEG, PNG, or WebP image."
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      "Images must be 5 MB or smaller."
    );
  }

  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "Your session has expired. Please sign in again."
    );
  }

  const extension = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  }[file.type];

  const filePath = [
    user.id,
    deckId,
    cardId,
    `${side}-${crypto.randomUUID()}.${extension}`,
  ].join("/");

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(
      `Image upload failed: ${uploadError.message}`
    );
  }

  return filePath;
}


export async function deleteFlashcardImages(
  paths: string[]
): Promise<void> {
  const uniquePaths = [...new Set(paths.filter(Boolean))];

  if (uniquePaths.length === 0) {
    return;
  }

  const supabase = createClient();

  const { data: userData, error: userError } =
    await supabase.auth.getUser();

  if (userError || !userData.user) {
    throw new Error(
      "Your session has expired. Please sign in again."
    );
  }

  // Ensure every path belongs to the authenticated user.
  const userId = userData.user.id;

  const unauthorizedPath = uniquePaths.some(
    (path) => path.split("/")[0] !== userId
  );

  if (unauthorizedPath) {
    throw new Error(
      "You are not authorized to delete these images."
    );
  }

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove(uniquePaths);

  if (error) {
    throw new Error(
      `Image cleanup failed: ${error.message}`
    );
  }
}

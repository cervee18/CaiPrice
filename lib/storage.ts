import type { SupabaseClient } from "@supabase/supabase-js";
import { compressImage } from "./image";

export async function uploadProductPhoto(
  supabase: SupabaseClient,
  file: File
): Promise<string> {
  const compressed = await compressImage(file);
  const path = `${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage
    .from("product-photos")
    .upload(path, compressed, { contentType: "image/jpeg" });
  if (error) throw error;
  return path;
}

export async function deleteProductPhoto(supabase: SupabaseClient, path: string) {
  await supabase.storage.from("product-photos").remove([path]);
}

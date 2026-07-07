"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import CameraIcon from "./CameraIcon";

export default function PhotoPicker({
  initialUrl,
  onChange,
}: {
  initialUrl: string | null;
  onChange: (file: File | null, removed: boolean) => void;
}) {
  const t = useTranslations("addProduct");
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(initialUrl);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onChange(file, false);
  }

  function handleRemove() {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
    onChange(null, true);
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500">
        {t("photo")}
      </label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />
      {preview ? (
        <div className="relative inline-block">
          {}
          <img
            src={preview}
            alt=""
            className="h-24 w-24 rounded-lg border border-slate-200 object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow hover:bg-red-50 hover:text-red-600"
          >
            ×
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 text-slate-400 hover:border-teal-400 hover:text-teal-600"
        >
          <CameraIcon className="h-6 w-6" />
          <span className="text-[10px]">{t("addPhoto")}</span>
        </button>
      )}
    </div>
  );
}

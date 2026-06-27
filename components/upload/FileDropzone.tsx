"use client";

import React, { useState, useRef, useCallback } from "react";
import { UploadCloud } from "lucide-react";
import { UploadProgress, UploadState } from "./UploadProgress";
import { toast } from "sonner";

interface FileDropzoneProps {
  folder: "profiles" | "assignments" | "notices" | "notes" | "misc";
  maxSizeMB?: number;
  allowedExtensions?: string[];
  onUploadComplete?: (fileData: any) => void;
  className?: string;
}

export function FileDropzone({
  folder,
  maxSizeMB = 20,
  allowedExtensions,
  onUploadComplete,
  className = "",
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const validateFile = (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File too large. Maximum size is ${maxSizeMB}MB.`);
      return false;
    }
    if (allowedExtensions) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!ext || !allowedExtensions.includes(ext)) {
        toast.error(`Invalid file type. Allowed: ${allowedExtensions.join(", ")}`);
        return false;
      }
    }
    return true;
  };

  const uploadFile = async (file: File) => {
    setFileName(file.name);
    setUploadState("UPLOADING");
    setProgress(0);
    setErrorMsg("");

    try {
      // 1. Get Signature
      const signRes = await fetch("/api/upload/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folder,
          originalName: file.name,
          bytes: file.size,
          format: file.name.split(".").pop(),
        }),
      });

      const signData = await signRes.json();
      if (!signRes.ok) {
        throw new Error(signData.error || "Failed to sign upload");
      }

      // 2. Upload to Cloudinary via XHR to track progress
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signData.apiKey);
      formData.append("timestamp", signData.timestamp.toString());
      formData.append("signature", signData.signature);
      formData.append("folder", signData.folder);
      formData.append("public_id", signData.uniqueId);

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(
          "POST",
          `https://api.cloudinary.com/v1_1/${signData.cloudName}/auto/upload`
        );

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setProgress(percentComplete);
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error("Cloudinary upload failed"));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(formData);
      });

      // 3. Complete Upload & Validate on Backend
      setUploadState("SCANNING");
      const completeRes = await fetch("/api/upload/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: signData.fileId }),
      });

      const completeData = await completeRes.json();
      if (!completeRes.ok) {
        throw new Error(completeData.error || "Failed to validate upload");
      }

      setUploadState("SUCCESS");
      if (onUploadComplete) {
        onUploadComplete(completeData.file);
      }
    } catch (err: any) {
      setUploadState("FAILED");
      setErrorMsg(err.message);
      toast.error(err.message);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (validateFile(file)) uploadFile(file);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [maxSizeMB, allowedExtensions, folder]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) uploadFile(file);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {!uploadState || uploadState === "FAILED" || uploadState === "SUCCESS" ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative w-full rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[160px]
            ${
              isDragging
                ? "border-[var(--primary)] bg-[var(--primary)]/5"
                : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)]"
            }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleChange}
            accept={
              allowedExtensions
                ? allowedExtensions.map((ext) => `.${ext}`).join(",")
                : undefined
            }
          />
          <UploadCloud
            className={`w-10 h-10 mb-4 ${
              isDragging ? "text-[var(--primary)]" : "text-[var(--text-secondary)]"
            }`}
          />
          <h3 className="text-[var(--text-primary)] font-semibold mb-1">
            Drag & drop file here
          </h3>
          <p className="text-[var(--text-secondary)] text-sm mb-4">
            or click to browse from your device
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[var(--text-secondary)] font-medium">
            <span className="bg-[var(--background)] px-2 py-1 rounded">
              Max size: {maxSizeMB}MB
            </span>
            {allowedExtensions && (
              <span className="bg-[var(--background)] px-2 py-1 rounded">
                {allowedExtensions.join(", ").toUpperCase()}
              </span>
            )}
          </div>
        </div>
      ) : null}

      {uploadState && uploadState !== "SUCCESS" && (
        <div className="mt-4">
          <UploadProgress
            progress={progress}
            state={uploadState}
            fileName={fileName}
            errorMessage={errorMsg}
          />
        </div>
      )}
    </div>
  );
}

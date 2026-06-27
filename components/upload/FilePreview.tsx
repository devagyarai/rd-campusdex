"use client";

import { FileText, Image as ImageIcon, Archive, File as FileIcon } from "lucide-react";
import Image from "next/image";

interface FilePreviewProps {
  url: string;
  format: string;
  originalName: string;
  size?: number;
}

export function FilePreview({ url, format, originalName, size }: FilePreviewProps) {
  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "image"].includes(format.toLowerCase());
  const isPdf = format.toLowerCase() === "pdf";
  const isArchive = ["zip", "rar", "tar", "gz"].includes(format.toLowerCase());
  const isDoc = ["doc", "docx", "txt", "rtf"].includes(format.toLowerCase());

  const formatSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="flex items-center p-3 border border-[var(--border)] rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors group">
      <div className="w-12 h-12 rounded bg-[var(--background)] flex items-center justify-center overflow-hidden flex-shrink-0 relative">
        {isImage ? (
          <Image src={url} alt={originalName} fill className="object-cover" />
        ) : isPdf ? (
          <FileText className="w-6 h-6 text-red-500" />
        ) : isArchive ? (
          <Archive className="w-6 h-6 text-yellow-500" />
        ) : isDoc ? (
          <FileText className="w-6 h-6 text-blue-500" />
        ) : (
          <FileIcon className="w-6 h-6 text-gray-500" />
        )}
      </div>
      <div className="ml-4 flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)] truncate" title={originalName}>
          {originalName}
        </p>
        <p className="text-xs text-[var(--text-secondary)]">
          {format.toUpperCase()} {size ? `• ${formatSize(size)}` : ""}
        </p>
      </div>
    </div>
  );
}

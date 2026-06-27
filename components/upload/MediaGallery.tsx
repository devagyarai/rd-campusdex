"use client";

import React from "react";
import { FilePreview } from "./FilePreview";
import { Trash2, Download } from "lucide-react";

export interface CloudFileDTO {
  id: string;
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  bytes: number;
  originalName: string;
}

interface MediaGalleryProps {
  files: CloudFileDTO[];
  onDelete?: (fileId: string) => void;
  className?: string;
}

export function MediaGallery({ files, onDelete, className = "" }: MediaGalleryProps) {
  if (!files || files.length === 0) {
    return null;
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {files.map((file) => (
        <div
          key={file.id}
          className="relative group bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden flex flex-col"
        >
          <FilePreview
            url={file.secureUrl}
            format={file.format}
            originalName={file.originalName}
            size={file.bytes}
          />
          
          <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <a
              href={file.secureUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={file.originalName}
              className="p-1.5 bg-white/90 hover:bg-white rounded shadow-sm text-gray-700 transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </a>
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(file.id)}
                className="p-1.5 bg-red-50 hover:bg-red-100 rounded shadow-sm text-red-600 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

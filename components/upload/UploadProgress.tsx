"use client";

import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export type UploadState = "UPLOADING" | "SCANNING" | "SUCCESS" | "FAILED";

interface UploadProgressProps {
  progress: number;
  state: UploadState;
  fileName?: string;
  errorMessage?: string;
}

export function UploadProgress({ progress, state, fileName, errorMessage }: UploadProgressProps) {
  const isUploading = state === "UPLOADING";
  const isScanning = state === "SCANNING";
  const isSuccess = state === "SUCCESS";
  const isFailed = state === "FAILED";

  return (
    <div className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2 overflow-hidden">
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />}
          {isFailed && <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
          {(isUploading || isScanning) && <Loader2 className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0" />}
          
          <span className="text-sm font-medium text-[var(--text-primary)] truncate">
            {fileName || "Uploading file..."}
          </span>
        </div>
        
        <span className="text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap ml-4">
          {isUploading && `${Math.round(progress)}%`}
          {isScanning && "Scanning..."}
          {isSuccess && "Complete"}
          {isFailed && "Failed"}
        </span>
      </div>

      <div className="relative h-2 w-full bg-[var(--surface-hover)] rounded-full overflow-hidden">
        <motion.div
          className={`absolute top-0 left-0 h-full rounded-full ${
            isFailed ? "bg-red-500" : isSuccess ? "bg-green-500" : "bg-blue-500"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${isUploading ? progress : 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {isFailed && errorMessage && (
        <p className="mt-2 text-xs text-red-500 font-medium">{errorMessage}</p>
      )}
    </div>
  );
}

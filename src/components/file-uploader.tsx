"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { CheckCircle2, Upload } from "lucide-react";
import { formatSize } from "../lib/utils";

interface FileUploaderProps {
  onFileSelect?: (file: File | null) => void;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0] || null;
      onFileSelect?.(file);
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, acceptedFiles, isDragActive } =
    useDropzone({
      onDrop,
      multiple: false,
      accept: { "application/pdf": [".pdf"] },
      maxSize: MAX_FILE_SIZE,
    });

  const file = acceptedFiles[0] || null;

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />

      {/* Upload Box */}
      {!file && (
        <div
          className={`flex flex-col items-center justify-center w-full px-6 py-12
            border-2 border-dashed rounded-xl cursor-pointer transition-all group
            ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-primary/5"
            }`}
        >
          <Upload className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors mb-3" />

          <p className="text-center">
            <span className="font-semibold text-foreground">
              Click to upload
            </span>
            <span className="text-muted-foreground block text-sm mt-1">
              or drag and drop
            </span>
          </p>

          <p className="text-xs text-muted-foreground mt-3">
            PDF document (max {formatSize(MAX_FILE_SIZE)})
          </p>
        </div>
      )}

      {/* Selected File */}
      {file && (
        <div
          className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg
            flex items-center gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />

          <div className="flex-1">
            <p className="font-medium text-sm truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatSize(file.size)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onFileSelect?.(null)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;

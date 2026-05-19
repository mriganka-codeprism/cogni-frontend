import React, {
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";

export interface ResumeUploadHandle {
  openFileDialog: () => void;
}

interface ResumeUploadProps {
  onFilesChange: (file: File | null) => void;
}

const JobDetailsUploadResume = forwardRef<
  ResumeUploadHandle,
  ResumeUploadProps
>(({ onFilesChange }, ref) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const allowedTypes = [
    "application/pdf",
    "application/msword", // .doc
    "application/x-msword", // .doc (alternative MIME type)
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/zip",
    "application/x-zip-compressed",
    "application/x-zip", // .zip (alternative MIME type)
  ];

  useImperativeHandle(ref, () => ({
    openFileDialog: () => {
      fileInputRef.current?.click();
    },
  }));

  const handleFile = (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const file = selectedFiles[0]; // ✅ only one file

    if (!allowedTypes.includes(file.type)) {
      alert("Only PDF, DOC, DOCX, or ZIP files are allowed.");
      return;
    }

    onFilesChange(file);
  };

  return (
    <input
      ref={fileInputRef}
      type="file"
      accept=".pdf,.doc,.docx,.zip"
      hidden
      onChange={(e) => handleFile(e.target.files)}
    />
  );
});

export default JobDetailsUploadResume;

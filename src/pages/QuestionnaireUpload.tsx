import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AddIcon from "@mui/icons-material/Add";
import DescriptionIcon from "@mui/icons-material/Description";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { extractQuestions } from "../api/api";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: "uploading" | "completed" | "error";
  file?: File;
}

interface Question {
  text: string;
  answer?: string;
  fileId?: string;
}

interface QuestionnaireUploadProps {
  embedded?: boolean;
  onValidationChange?: (valid: boolean) => void;
  onUploadComplete?: (files: any[]) => void;
  clearTrigger?: number;
}

const QuestionnaireUpload: React.FC<QuestionnaireUploadProps> = ({
  embedded,
  onValidationChange,
  onUploadComplete,
  clearTrigger,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [error, setError] = useState<string>("");
  const [openAddQuestionModal, setOpenAddQuestionModal] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [openFileDecisionDialog, setOpenFileDecisionDialog] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [openDeleteConfirmDialog, setOpenDeleteConfirmDialog] = useState(false);
  const [pendingDeleteFileId, setPendingDeleteFileId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasRestored = useRef(false);
  const STORAGE_KEY = "questionnaireForm";
  const FILES_STORAGE_KEY = "questionnaireFiles";

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(() => {
    const saved = sessionStorage.getItem(FILES_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Handle legacy format of string[] by converting to Question[]
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
          return parsed.map((text: string) => ({ text }));
        }
        return parsed;
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // No additional mount effect needed for loading as it's done in useState initializers

  // Persist questions and files to sessionStorage on change
  React.useEffect(() => {
    if (hasRestored.current) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
    }
  }, [questions]);

  React.useEffect(() => {
    // Only store serializable metadata, not the actual File object
    const filesToStore = uploadedFiles.map(({ file, ...rest }) => rest);
    if (hasRestored.current) {
      sessionStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(filesToStore));
    }
  }, [uploadedFiles]);

  const hasProcessedClear = useRef<number | null>(clearTrigger || 0);

  // ✅ Mark as restored after mount to enable saving skip on initial render
  React.useEffect(() => {
    hasRestored.current = true;
  }, []);

  React.useEffect(() => {
    if (clearTrigger && hasProcessedClear.current !== clearTrigger) {
      hasProcessedClear.current = clearTrigger;
      setUploadedFiles([]);
      setQuestions([]);
      setError("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(FILES_STORAGE_KEY);
      if (onValidationChange) onValidationChange(false);
    }
  }, [clearTrigger, onValidationChange]);

  const ALLOWED_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",
    "application/x-zip-compressed",
    "application/x-rar-compressed",
  ];

  const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".zip"];
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) =>
      fileName.endsWith(ext)
    );

    if (!hasValidExtension) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: PDF, DOC, DOCX, ZIP`,
      };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds 50MB limit. Your file is ${formatFileSize(file.size)}`,
      };
    }

    return { valid: true };
  };

  const simulateUploadProgress = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress > 90) progress = 90;

      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, progress } : f
        )
      );

      if (progress >= 90) {
        clearInterval(interval);
        setTimeout(() => {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? { ...f, progress: 100, status: "completed" }
                : f
            )
          );
        }, 500);
      }
    }, 300);
  };

  const callExtractQuestionsApi = async (file: File, fileId: string) => {
    try {
      const token = sessionStorage.getItem("access_token");
      if (!token) throw new Error("Authentication token missing");

      const response = await extractQuestions(file, token);

      // Expected API format: { questions: [...] }
      if (response?.questions && Array.isArray(response.questions)) {
        const extracted = response.questions
          .map((q: any) => {
            // Case 1: API returns string
            if (typeof q === "string") {
              return { text: q, answer: "" };
            }

            // Case 2: API returns object
            return {
              text: q.question || q.text || "",
              answer: q.answer || "",
            };
          })
          .filter((q: { text: string }) => q.text.trim().length > 0);

        if (extracted.length) {
          const newQuestions: Question[] = extracted.map((q: { text: string; answer: string }) => ({
            text: q.text,
            answer: q.answer,
            fileId,
          }));

          setQuestions((prev) => [...prev, ...newQuestions]);
        }
      } else {
        throw new Error("No questions returned from API");
      }
    } catch (err) {
      console.error("Extract questions failed:", err);
      setError("Failed to extract questions from file.");
    }
  };
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError("");

    // Only take the first file
    const file = files[0];
    const validation = validateFile(file);

    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      return;
    }

    // If files already exist, show decision dialog
    if (uploadedFiles.length > 0) {
      setPendingFile(file);
      setOpenFileDecisionDialog(true);
      return;
    }

    // Otherwise proceed with upload
    await performFileUpload(file, false);
  };

  const performFileUpload = async (file: File, isAppend: boolean) => {
    const fileId = `${file.name}-${Date.now()}`;

    const newFile: UploadedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
      progress: 0,
      status: "uploading",
      file,
    };

    if (isAppend) {
      // Append: add to existing files
      setUploadedFiles((prev) => [...prev, newFile]);
    } else {
      // Replace: clear existing files and questions
      setUploadedFiles([newFile]);
      setQuestions([]); // Clear existing questions when replacing file
    }

    // Simulate progress
    simulateUploadProgress(fileId);

    // Call extract API to append questions
    await callExtractQuestionsApi(file, fileId);

    if (onValidationChange) {
      onValidationChange(true);
    }

    // Allow same file upload again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleReplaceFile = async () => {
    if (!pendingFile) return;
    setOpenFileDecisionDialog(false);
    setPendingFile(null);
    await performFileUpload(pendingFile, false);
  };

  const handleAppendFile = async () => {
    if (!pendingFile) return;
    setOpenFileDecisionDialog(false);
    setPendingFile(null);
    await performFileUpload(pendingFile, true);
  };

  const handleCloseFileDecisionDialog = () => {
    setOpenFileDecisionDialog(false);
    setPendingFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleAddQuestion = () => {
    setOpenAddQuestionModal(true);
  };

  const handleCloseQuestionModal = () => {
    setOpenAddQuestionModal(false);
    setQuestionText("");
    setAnswerText("");
    setEditingIndex(null);
  };

  const handleSaveQuestion = () => {
    if (questionText.trim()) {
      if (editingIndex !== null) {
        // Editing existing question
        setQuestions((prev) =>
          prev.map((q, i) => (i === editingIndex ? { ...q, text: questionText.trim(), answer: answerText.trim() } : q))
        );
        handleCloseQuestionModal();
      } else {
        // Adding new question(s)
        const newQuestions = questionText
          .split("\n")
          .map((q) => q.trim())
          .filter((q) => q.length > 0);

        if (newQuestions.length > 0) {
          const questionsToAdd: Question[] = newQuestions.map((text) => ({
            text,
            answer: answerText.trim(),
          }));
          setQuestions((prev) => [...prev, ...questionsToAdd]);
          handleCloseQuestionModal();
        }
      }
    }
  };

  const handleEditQuestion = (index: number) => {
    setEditingIndex(index);
    setQuestionText(questions[index].text);
    setAnswerText(questions[index].answer || "");
    setOpenAddQuestionModal(true);
  };

  const handleDeleteFile = (fileId: string) => {
    setPendingDeleteFileId(fileId);
    setOpenDeleteConfirmDialog(true);
  };

  const handleConfirmDeleteFile = () => {
    if (!pendingDeleteFileId) return;

    // Remove the file
    setUploadedFiles((prev) => prev.filter((f) => f.id !== pendingDeleteFileId));

    // Remove all questions associated with this file
    setQuestions((prev) =>
      prev.filter((q) => q.fileId !== pendingDeleteFileId)
    );

    // Reset file input to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setOpenDeleteConfirmDialog(false);
    setPendingDeleteFileId(null);
  };

  const handleCancelDeleteFile = () => {
    setOpenDeleteConfirmDialog(false);
    setPendingDeleteFileId(null);
  };

  const handleDownloadFile = (file?: File) => {
    if (!file) return;

    // Create a blob URL and open in new tab
    const url = URL.createObjectURL(file);
    window.open(url, '_blank');
  };

  const handleDeleteQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newQuestions = [...questions];
    const draggedQuestion = newQuestions[draggedIndex];

    // Remove from original position
    newQuestions.splice(draggedIndex, 1);

    // Insert at new position
    newQuestions.splice(dropIndex, 0, draggedQuestion);

    setQuestions(newQuestions);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <Box sx={{ paddingTop: "1.5vh", display: "flex", flexDirection: "column", maxHeight: "54vh", width: "75vw", marginRight: "auto" }}>
      <Box sx={{ maxWidth: "100%", margin: "0 auto", width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header with Title and Buttons */}
        <Box sx={{ display: "flex", alignItems: "flex-end", gap: "2vh", mb: "2vh" }}>
          {/* Left Section: Title */}
          <Box>
            <Typography sx={{ fontSize: "2vh", fontWeight: 700, mb: "0.8vh", color: "#1a1a1a" }}>
              Questionnaire
            </Typography>
            <Typography sx={{ fontSize: "1.5vh", color: "#666", lineHeight: "1vh" }}>
              Define the Question on which candidates will be evaluated
            </Typography>
          </Box>

          {/* Spacer to push right section to the end */}
          <Box sx={{ flex: 1 }} />

          {/* Right Section: File Display + Buttons */}
          <Box sx={{ display: "flex", gap: "1.5vh", alignItems: "center", flexShrink: 0 }}>
            {/* Uploaded Files Display */}
            {uploadedFiles.length > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: "1vh" }}>
                {uploadedFiles.map((file) => (
                  <Box key={file.id} sx={{ display: "flex", alignItems: "center", gap: "1vh" }}>
                    <Typography
                      onClick={() => handleDownloadFile(file.file)}
                      sx={{
                        fontSize: "1.4vh",
                        color: "#900B09",
                        fontWeight: 500,
                        textDecoration: "underline",
                        cursor: "pointer",
                        "&:hover": {
                          opacity: 0.8,
                        },
                      }}
                    >
                      {file.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteFile(file.id)}
                      sx={{
                        padding: "0.3vh",
                        color: "#900B09",
                        "&:hover": {
                          color: "#900B09",
                          backgroundColor: "transparent",
                        },
                      }}
                    >
                      <CloseIcon sx={{ fontSize: "1.6vh" }} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}

            {/* Buttons */}
            <Box sx={{ display: "flex", gap: "1.5vh" }}>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={handleUploadClick}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "1.3vh",
                  borderColor: "#006b66",
                  color: "#006b66",
                  padding: "0.8vh 2vh",
                  borderRadius: "0.8vh",
                  "&:hover": {
                    backgroundColor: "#ecf0f1",
                    borderColor: "#006b66",
                  },
                }}
              >
                Upload Questions
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddQuestion}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "1.3vh",
                  backgroundColor: "#006b66",
                  padding: "0.8vh 2vh",
                  borderRadius: "0.8vh",
                  "&:hover": {
                    backgroundColor: "#005a56",
                  },
                }}
              >
                Add Question
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: "2vh" }}>
            {error}
          </Alert>
        )}

        {/* Scrollable Content Section */}
        <Box sx={{
          flex: 1,
          overflowY: "auto",
          minHeight: 0,
          borderTop: "1px solid #e5e7eb",
          mt: "2vh",
          pt: "2vh",
          display: "flex",
          flexDirection: "column",
          "&::-webkit-scrollbar": {
            width: "0.6vh",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#bdbdbd",
            borderRadius: "0.3vh",
            "&:hover": {
              backgroundColor: "#9ca3af",
            },
          },
          scrollbarWidth: "thin",
          scrollbarColor: "#bdbdbd transparent",
        }}>
          {/* Drag and Drop Area */}
          {uploadedFiles.length === 0 && questions.length === 0 && (
            <Box
              onClick={handleUploadClick}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "37vh",
                backgroundColor: "transparent",
                padding: "2vh",
                cursor: "pointer",
                transition: "all 0.3s ease",
                width: "100%",
              }}
            >
              <Box
                sx={{
                  width: "8vh",
                  height: "8vh",
                  borderRadius: "1.5vh",
                  backgroundColor: "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: "2vh",
                }}
              >
                <DescriptionIcon sx={{ fontSize: "4.5vh", color: "#d1d5db" }} />
              </Box>
              <Typography sx={{ fontSize: "1.8vh", fontWeight: 600, mb: "0.5vh", color: "#1a1a1a" }}>
                No questions added yet
              </Typography>
              <Typography sx={{ fontSize: "1.4vh", color: "#888" }}>
                Upload a file or add questions manually to get started
              </Typography>
            </Box>
          )}

          {/* Questions List - Scrollable below uploaded files */}
          {questions.length > 0 && (
            <Box sx={{}}>
              <List
                sx={{
                  width: "100%",
                  paddingRight: "1vh",
                }}
              >
                {questions.map((question, index) => (
                  <ListItem
                    key={index}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    sx={{
                      backgroundColor: draggedIndex === index ? "#e8f8f6" : dragOverIndex === index ? "#f0f9f8" : "#f9fafb",
                      borderRadius: "0.8vh",
                      mb: "1.2vh",
                      py: "1.5vh",
                      px: "1.5vh",
                      display: "flex",
                      alignItems: "center",
                      gap: "1.2vh",
                      border: dragOverIndex === index ? "2px dashed #048b7a" : "1px solid #e5e7eb",
                      opacity: draggedIndex === index ? 0.6 : 1,
                      cursor: "grab",
                      transition: "all 0.2s ease",
                      "&:active": {
                        cursor: "grabbing",
                      },
                    }}
                  >
                    {/* Drag Handle */}
                    <DragIndicatorIcon
                      sx={{
                        fontSize: "1.8vh",
                        color: "#bdbdbd",
                        flexShrink: 0,
                        cursor: "grab",
                      }}
                    />

                    {/* Question Number Badge */}
                    <Box
                      sx={{
                        width: "3vh",
                        height: "3vh",
                        borderRadius: "50%",
                        backgroundColor: "#048b7a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "1.2vh",
                      }}
                    >
                      {index + 1}
                    </Box>

                    {/* Question Text and Answer */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: "1.4vh",
                          fontWeight: 600,
                          color: "#048b7a",
                          mb: "0.3vh",
                        }}
                      >
                        Question:
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "1.3vh",
                          fontWeight: 500,
                          color: "#1a1a1a",
                          mb: "0.8vh",
                          wordBreak: "break-word",
                        }}
                      >
                        {question.text}
                      </Typography>
                      {question.answer && (
                        <>
                          <Typography
                            sx={{
                              fontSize: "1.4vh",
                              fontWeight: 600,
                              color: "#048b7a",
                              mb: "0.3vh",
                            }}
                          >
                            Answer:
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "1.3vh",
                              fontWeight: 400,
                              color: "#1a1a1a",
                              wordBreak: "break-word",
                            }}
                          >
                            {question.answer}
                          </Typography>
                        </>
                      )}
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: "flex", gap: "0.5vh", flexShrink: 0 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditQuestion(index)}
                        sx={{
                          color: "#006b66",
                          padding: "0.5vh",
                          "&:hover": {
                            backgroundColor: "rgba(0, 107, 102, 0.1)",
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteQuestion(index)}
                        sx={{
                          color: "#900B09",
                          padding: "0.5vh",
                          "&:hover": {
                            backgroundColor: "rgba(144, 11, 9, 0.1)",
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
      </Box>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.zip"
        onChange={(e) => handleFiles(e.target.files)}
        style={{ display: "none" }}
      />

      {/* Add Question Modal */}
      <Dialog
        open={openAddQuestionModal}
        onClose={handleCloseQuestionModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "1.2vh",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: "1.6vh",
            fontWeight: 700,
            color: "#1a1a1a",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "2.5vh 2.5vh 2vh 2.5vh",
            borderBottom: "none",
          }}
        >
          {editingIndex !== null ? "Edit Question" : "Add New Question"}
          <IconButton
            onClick={handleCloseQuestionModal}
            sx={{
              color: "#9ca3af",
              padding: "0",
              "&:hover": {
                backgroundColor: "transparent",
                color: "#6b7280",
              },
            }}
          >
            <CloseIcon sx={{ fontSize: "2.2vh" }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ padding: "1.5vh 2.5vh 2.5vh 2.5vh" }}>
          <Typography
            sx={{
              fontSize: "1.3vh",
              fontWeight: 500,
              color: "#374151",
              marginBottom: "1vh",
            }}
          >
            Question 
          </Typography>
          <TextField
            fullWidth
            placeholder="Enter your question here..."
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            multiline
            rows={4}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: "1.3vh",
                borderRadius: "0.6vh",
                border: "1px solid #e5e7eb",
                backgroundColor: "#fff",
                "& fieldset": {
                  borderColor: "#e5e7eb",
                },
                "&:hover fieldset": {
                  borderColor: "#d1d5db",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#006b66",
                  borderWidth: "1px",
                },
              },
              "& .MuiInputBase-input::placeholder": {
                color: "#bdbdbd",
                opacity: 1,
              },
            }}
          />
          <Typography
            sx={{
              fontSize: "1.3vh",
              fontWeight: 500,
              color: "#374151",
              marginTop: "1.5vh",
              marginBottom: "1vh",
            }}
          >
            Answer 
          </Typography>
          <TextField
            fullWidth
            placeholder="Enter the answer here..."
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            multiline
            rows={4}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: "1.3vh",
                borderRadius: "0.6vh",
                border: "1px solid #e5e7eb",
                backgroundColor: "#fff",
                "& fieldset": {
                  borderColor: "#e5e7eb",
                },
                "&:hover fieldset": {
                  borderColor: "#d1d5db",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#006b66",
                  borderWidth: "1px",
                },
              },
              "& .MuiInputBase-input::placeholder": {
                color: "#bdbdbd",
                opacity: 1,
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ padding: "2vh 2.5vh", gap: "1.5vh", justifyContent: "flex-end" }}>
          <Button
            onClick={handleCloseQuestionModal}
            variant="outlined"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: "1.3vh",
              color: "#6b7280",
              borderColor: "#d1d5db",
              padding: "0.7vh 2vh",
              borderRadius: "0.6vh",
              "&:hover": {
                backgroundColor: "#f9fafb",
                borderColor: "#d1d5db",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveQuestion}
            variant="contained"
            disabled={!questionText.trim()}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: "1.3vh",
              backgroundColor: "#006b66",
              padding: "0.7vh 2vh",
              borderRadius: "0.6vh",
              "&:hover": {
                backgroundColor: "#006b66",
              },
              "&:disabled": {
                backgroundColor: "#d1d5db",
                color: "#9ca3af",
              },
            }}
          >
            {editingIndex !== null ? "Save Changes" : "Add Question"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* File Decision Dialog - Replace or Append */}
      <Dialog
        open={openFileDecisionDialog}
        onClose={handleCloseFileDecisionDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "1.2vh",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: "1.6vh",
            fontWeight: 700,
            color: "#1a1a1a",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "2.5vh 2.5vh 2vh 2.5vh",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          File Already Uploaded
          <IconButton
            onClick={handleCloseFileDecisionDialog}
            sx={{
              color: "#9ca3af",
              padding: "0",
              "&:hover": {
                backgroundColor: "transparent",
                color: "#6b7280",
              },
            }}
          >
            <CloseIcon sx={{ fontSize: "2.2vh" }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ padding: "2vh 2.5vh" }}>
          <Typography
            sx={{
              fontSize: "1.3vh",
              fontWeight: 500,
              color: "#374151",
              marginBottom: "1.5vh",
              lineHeight: "1.6",
            }}
          >
            A file has already been uploaded. What would you like to do?
          </Typography>
          <Box
            sx={{
              backgroundColor: "#f3f4f6",
              padding: "1.5vh",
              borderRadius: "0.8vh",
              marginBottom: "2.5vh",
            }}
          >
            <Typography
              sx={{
                fontSize: "1.2vh",
                color: "#666",
                fontWeight: 600,
              }}
            >
              Current file:
            </Typography>
            <Typography
              sx={{
                fontSize: "1.3vh",
                color: "#1a1a1a",
                marginTop: "0.5vh",
              }}
            >
              {uploadedFiles.length > 0 && uploadedFiles[0].name}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: "#fef3f2",
              padding: "1.5vh",
              borderRadius: "0.8vh",
            }}
          >
            <Typography
              sx={{
                fontSize: "1.2vh",
                color: "#666",
                fontWeight: 600,
              }}
            >
              New file:
            </Typography>
            <Typography
              sx={{
                fontSize: "1.3vh",
                color: "#1a1a1a",
                marginTop: "0.5vh",
              }}
            >
              {pendingFile?.name}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: "2vh 2.5vh", gap: "1.5vh", justifyContent: "flex-end", borderTop: "1px solid #e5e7eb" }}>
          <Button
            onClick={handleCloseFileDecisionDialog}
            variant="outlined"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: "1.3vh",
              color: "#6b7280",
              borderColor: "#d1d5db",
              padding: "0.7vh 2vh",
              borderRadius: "0.6vh",
              "&:hover": {
                backgroundColor: "#f9fafb",
                borderColor: "#d1d5db",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAppendFile}
            variant="outlined"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: "1.3vh",
              color: "#048b7a",
              borderColor: "#048b7a",
              padding: "0.7vh 2vh",
              borderRadius: "0.6vh",
              "&:hover": {
                backgroundColor: "rgba(4, 139, 122, 0.1)",
                borderColor: "#048b7a",
              },
            }}
          >
            Append
          </Button>
          <Button
            onClick={handleReplaceFile}
            variant="contained"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: "1.3vh",
              backgroundColor: "#900B09",
              padding: "0.7vh 2vh",
              borderRadius: "0.6vh",
              "&:hover": {
                backgroundColor: "#7a0907",
              },
            }}
          >
            Replace
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete File Confirmation Dialog */}
      <Dialog
        open={openDeleteConfirmDialog}
        onClose={handleCancelDeleteFile}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "1.2vh",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: "1.6vh",
            fontWeight: 700,
            color: "#1a1a1a",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "2.5vh 2.5vh 2vh 2.5vh",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          Delete File?
          <IconButton
            onClick={handleCancelDeleteFile}
            sx={{
              color: "#9ca3af",
              padding: "0",
              "&:hover": {
                backgroundColor: "transparent",
                color: "#6b7280",
              },
            }}
          >
            <CloseIcon sx={{ fontSize: "2.2vh" }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ padding: "2vh 2.5vh" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: "1.5vh",
            }}
          >
            <Box
              sx={{
                width: "4vh",
                height: "4vh",
                borderRadius: "50%",
                backgroundColor: "rgba(144, 11, 9, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <DeleteIcon sx={{ color: "#900B09", fontSize: "2.2vh" }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: "1.4vh",
                  fontWeight: 600,
                  color: "#1a1a1a",
                  marginBottom: "0.8vh",
                }}
              >
                Are you sure?
              </Typography>
              <Typography
                sx={{
                  fontSize: "1.3vh",
                  color: "#666",
                  lineHeight: "1.6",
                }}
              >
                Deleting this file will also remove all the questions extracted from it. This action cannot be undone.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: "2vh 2.5vh", gap: "1.5vh", justifyContent: "flex-end", borderTop: "1px solid #e5e7eb" }}>
          <Button
            onClick={handleCancelDeleteFile}
            variant="outlined"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: "1.3vh",
              color: "#6b7280",
              borderColor: "#d1d5db",
              padding: "0.7vh 2vh",
              borderRadius: "0.6vh",
              "&:hover": {
                backgroundColor: "#f9fafb",
                borderColor: "#d1d5db",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDeleteFile}
            variant="contained"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: "1.3vh",
              backgroundColor: "#900B09",
              padding: "0.7vh 2vh",
              borderRadius: "0.6vh",
              "&:hover": {
                backgroundColor: "#7a0907",
              },
            }}
          >
            Delete File
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuestionnaireUpload;

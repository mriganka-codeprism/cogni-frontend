import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const DEFAULT_SUBJECT =
  "MuSigma - muCognitron Interview Link (Next Step in Hiring Process)";

const DEFAULT_BODY = `<p style="color: #555; font-size: 16px; line-height: 1.6;">Dear Candidate,</p>
<p style="color: #555; font-size: 16px; line-height: 1.6;">You have been shortlisted for the next stage of the ongoing campus hiring process. As part of this, you are required to complete an interview through our AI-powered interviewer on the <strong>muCognitron</strong> platform.</p>
<p style="color: #555; font-size: 16px; line-height: 1.6;"><strong>This is a mandatory step</strong> to proceed to the next round. Please complete it within the allotted time.</p>
<p style="color: #555; font-size: 16px; line-height: 1.6;">Best of luck!<br/><strong>Team muCognitron</strong></p>`;

interface EmailPreviewModalProps {
  open: boolean;
  recipientCount: number;
  onConfirm: (subject: string, htmlBody: string) => void;
  onCancel: () => void;
}

const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  open,
  recipientCount,
  onConfirm,
  onCancel,
}) => {
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [body, setBody] = useState(DEFAULT_BODY);

  const handleConfirm = () => {
    onConfirm(subject, body);
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "1.2vh",
          maxHeight: "85vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "2vh 2.5vh",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Box>
          <Typography
            sx={{ fontSize: "1.8vh", fontWeight: 700, color: "#101828" }}
          >
            Review Email Before Sending
          </Typography>
          <Typography sx={{ fontSize: "1.2vh", color: "#667085", marginTop: "0.3vh" }}>
            Sending to {recipientCount} candidate{recipientCount > 1 ? "s" : ""}
            {" — "}edit subject or body if needed
          </Typography>
        </Box>
        <IconButton onClick={onCancel} size="small">
          <CloseIcon sx={{ fontSize: "2vh" }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ padding: "2vh 2.5vh", overflow: "auto" }}>
        {/* Subject */}
        <Typography
          sx={{
            fontSize: "1.3vh",
            fontWeight: 600,
            color: "#344054",
            marginBottom: "0.5vh",
            marginTop: "1vh",
          }}
        >
          Subject:
        </Typography>
        <TextField
          fullWidth
          size="small"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          sx={{
            marginBottom: "1.5vh",
            "& .MuiInputBase-input": { fontSize: "1.3vh" },
          }}
        />

        {/* Body */}
        <Typography
          sx={{
            fontSize: "1.3vh",
            fontWeight: 600,
            color: "#344054",
            marginBottom: "0.5vh",
          }}
        >
          Email Body:
        </Typography>
        <Box
          sx={{
            border: "1px solid #d1d5db",
            borderRadius: "0.6vh",
            backgroundColor: "#ffffff",
            "& .ql-toolbar": {
              borderRadius: "0.6vh 0.6vh 0 0",
              borderBottom: "1px solid #d1d5db",
            },
            "& .ql-container": {
              borderRadius: "0 0 0.6vh 0.6vh",
              fontSize: "1.4vh",
              minHeight: "25vh",
              border: "none",
            },
            "& .ql-editor": {
              minHeight: "25vh",
              fontFamily: "'Aptos', 'Calibri', sans-serif",
              fontSize: "1.3vh",
              lineHeight: "1.6",
              color: "#333",
            },
          }}
        >
          <ReactQuill
            theme="snow"
            value={body}
            onChange={setBody}
            modules={{
              toolbar: [
                [{ header: [1, 2, 3, false] }],
                ["bold", "italic", "underline", "strike"],
                [{ list: "ordered" }, { list: "bullet" }],
                [{ align: [] }],
                [{ color: [] }, { background: [] }],
                ["link"],
                ["clean"],
              ],
            }}
            formats={[
              "header",
              "bold",
              "italic",
              "underline",
              "strike",
              "list",
              "align",
              "color",
              "background",
              "link",
            ]}
          />
        </Box>

        {/* Note about interview link */}
        <Typography
          sx={{
            fontSize: "1.1vh",
            color: "#9ca3af",
            marginTop: "1vh",
            fontStyle: "italic",
          }}
        >
          Note: The "Start Interview" button with the candidate's unique link
          and the link expiry notice are added automatically below your message.
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          padding: "1.5vh 2.5vh",
          borderTop: "1px solid #e5e7eb",
          justifyContent: "space-between",
        }}
      >
        <Button
          onClick={onCancel}
          sx={{
            textTransform: "none",
            fontSize: "1.3vh",
            fontWeight: 600,
            color: "#374151",
            borderColor: "#e5e7eb",
            borderRadius: "0.8vh",
            padding: "0.7vh 2vh",
          }}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          startIcon={<SendIcon sx={{ fontSize: "1.6vh !important" }} />}
          disabled={!subject.trim()}
          sx={{
            textTransform: "none",
            fontSize: "1.3vh",
            fontWeight: 600,
            backgroundColor: "#00695C",
            borderRadius: "0.8vh",
            padding: "0.7vh 2.5vh",
            "&:hover": { backgroundColor: "#004d40" },
            "&.Mui-disabled": { backgroundColor: "#e5e7eb", color: "#9ca3af" },
          }}
        >
          Send to {recipientCount} Candidate{recipientCount > 1 ? "s" : ""}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmailPreviewModal;

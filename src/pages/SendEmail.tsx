import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, TextField, Button, Chip, Dialog, DialogContent } from "@mui/material";
import { useParams, useNavigate,useLocation } from "react-router-dom";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import SendIcon from "@mui/icons-material/Send";
import CircularProgress from "@mui/material/CircularProgress";
import { styles } from "../styles/SendEmail.styles";
import { routes } from "../constants/routes";
import { getAtsJobById, getAtsJobs } from "../api/api";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';



const SendEmail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
const job = location.state?.job;
  const [recipientFocus, setRecipientFocus] = useState(false);
  const [isToExpanded, setIsToExpanded] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const toBoxRef = useRef<HTMLDivElement>(null);
  const [emailBody, setEmailBody] = useState(`Dear Candidate,

We are pleased to invite you for an interview for the Senior Software Engineer – Backend position at Mu Sigma.

Based on our AI evaluation of your profile, we believe your technical expertise aligns well with our requirements.

Please use the link below to schedule your technical interview at your convenience:
[Interview Link]

Looking forward to our conversation.

Best Regards,
Karthik`);

  // Handle click outside to collapse TO field
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toBoxRef.current && !toBoxRef.current.contains(event.target as Node)) {
        setIsToExpanded(false);
      }
    };

    if (isToExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isToExpanded]);

  // Calculate the height needed for recipients (without scroll)
  // Note: Now using fixed heights - 3.8vh when collapsed, 12vh when expanded
  // This matches Outlook's simple collapse/expand behavior

 // const [recipients, setRecipients] = useState<string[]>([]);
const [inputValue, setInputValue] = useState("");
//const [recipientFocus, setRecipientFocus] = useState(false);

const addRecipient = () => {
  const email = inputValue.trim();

  if (!email) return;

  // simple email validation
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!emailValid) return;

  if (!recipients.includes(email)) {
    setRecipients(prev => [...prev, email]);
  }

  setInputValue("");
};


 const [recipients, setRecipients] = useState<string[]>([
  "alex.wright@example.com",
  "s.jenkins@example.com",
  "mchen88@gmail.com",
  "emily.r@techcorp.io",
  "david.kim@design.com",
  "alex.wright@example.com",
  "s.jenkins@example.com",
  "mchen88@gmail.com",
  "emily.r@techcorp.io",
  "david.kim@design.com",
  "alex.wright@example.com",
  "s.jenkins@example.com",
  "mchen88@gmail.com",
  "emily.r@techcorp.io",
  "david.kim@design.com",
  "alex.wright@example.com",
  "s.jenkins@example.com",
  "mchen88@gmail.com",
  "emily.r@techcorp.io",
  "david.kim@design.com",
  
]);

  const handleSendEmails = async () => {
    setIsSending(true);
    // Simulate email sending
    try {
      await new Promise(resolve => setTimeout(resolve, 2500));
      setIsSending(false);
      
      // Fetch job data and store it before navigating
      if (id) {
        try {
          const apiJob = await getAtsJobById(id);
          if (apiJob) {
            // Store job in sessionStorage so JobDetails can access it
            sessionStorage.setItem('tempJob', JSON.stringify(apiJob));
          }
        } catch (err) {
          console.log("Could not fetch job details");
        }
      }
      
      // Navigate to JobDetails page
     navigate(routes.jobDetails.replace(":id", id || ""));
    } catch (error) {
      setIsSending(false);
      console.error("Error sending emails:", error);
    }
  };

  return (
    <Box sx={styles.root}>
      {/* BREADCRUMB */}
      {/* 🔹 1️⃣ BREADCRUMB (TOP MOST) */}
    <Box sx={styles.breadcrumbWrapper}>
      <Typography sx={styles.breadcrumb}>
        <span onClick={() => navigate(routes.createJob)} style={{ cursor: "pointer" }}>
          Home
        </span>
        &nbsp; &gt; &nbsp;
        <span
          onClick={() =>
  navigate(routes.sendEmail.replace(":id", id || ""), {
    state: { job: location.state?.job }
  })
}
          style={{ cursor: "pointer" }}
        >
          Job Details
        </span>
        &nbsp; &gt; &nbsp;
        <span
          onClick={() => navigate(`/admin/job/${id}/score-summary`)}
          style={{ cursor: "pointer" }}
        >
          Score Summary
        </span>
        &nbsp; &gt; &nbsp;
        <strong>Email</strong>
      </Typography>
    </Box>

    {/* 🔹 2️⃣ JOB HEADER */}
    <Box sx={styles.jobHeader}>
      <Box sx={{ display: "flex", alignItems: "center", gap: "1vh" }}>
        <Typography sx={styles.jobTitle}>
          Software Engineer – Backend
        </Typography>

        <Box sx={styles.statusBadge}>Active</Box>
      </Box>

      {/* <Typography sx={styles.jobId}>
        JOB-2026-0145
      </Typography> */}
    </Box>
      {/* CARD */}
      <Box sx={styles.card}>
        <Typography sx={styles.cardTitle}>Send Email</Typography>
        <Typography sx={styles.cardSubtitle}>
          Send personalized interview links to selected candidates
        </Typography>

        {/* TO */}
        <Typography sx={styles.label}>To:</Typography>

        <Box
          ref={toBoxRef}
          sx={{
            ...styles.recipientBox,
            maxHeight: isToExpanded ? "12vh" : "4.6vh",
            overflowY: isToExpanded || recipients.length <= 3 ? "auto" : "hidden",
            cursor: "pointer",
            //transition: "all 0.3s ease",
            border: "1px solid #d1d5db",
            backgroundColor: "#ffffff",
            padding: "0.6vh 0.8vh",
            "&:hover": {
            //  borderColor: "#9ca3af",
             // backgroundColor: "#fafbfc"
            },
            "&:focus-within": {
              borderColor: "#006b66",
              outline: "none",
              boxShadow: "0 0 0 3px rgba(0, 107, 102, 0.1)"
            }
          }}
          onClick={() => {
            // Toggle expand/collapse
            setIsToExpanded(!isToExpanded);
          }}
        >
          {recipients.map((email, i) => (
            <Chip
              key={i}
              label={email}
              onDelete={(e) => {
                e.stopPropagation();
                setRecipients(prev => prev.filter((_, idx) => idx !== i));
              }}
              sx={styles.recipientChip}
            />
          ))}

          {recipients.length > 0 && !isToExpanded && recipients.length > 3 && (
            <Box
              sx={{
                fontSize: "1.3vh",
                color: "#0066cc",
                fontWeight: 600,
                alignSelf: "center",
                padding: "0.4vh 0.8vh",
                backgroundColor: "#f0f7ff",
                borderRadius: "0.4vh",
                whiteSpace: "nowrap",
                "&:hover": {
                  backgroundColor: "#e6f0ff",
                  textDecoration: "underline",
                },
              }}
              onClick={(e) => {
                e.stopPropagation();
                setIsToExpanded(true);
              }}
            >
              +{recipients.length - 3} more
            </Box>
          )}
        </Box>


        {/* FROM */}
        <Typography sx={styles.label}>From:</Typography>
        <TextField
          fullWidth
          value="karthik.design@musigma.com"
        />

        {/* SUBJECT */}
        <Typography sx={styles.label}>Subject:</Typography>
        <TextField
          fullWidth
          value="Interview Invitation - Senior Software Engineer Position"
        />

        {/* BODY */}
        <Typography sx={styles.label}>Message:</Typography>
        <Box sx={{ 
          border: "1px solid #d1d5db", 
          borderRadius: "0.6vh",
          backgroundColor: "#ffffff",
          "& .ql-toolbar": {
            borderRadius: "0.6vh 0.6vh 0 0",
            borderBottomColor: "#d1d5db",
            borderBottomWidth: "0.1vh",
          },
          "& .ql-container": {
            borderRadius: "0 0 0.6vh 0.6vh",
            fontSize: "1.4vh",
            minHeight: "20vh",
          },
          "& .ql-editor": {
            minHeight: "20vh",
            fontFamily: "'Aptos', 'Calibri', sans-serif",
            fontSize: "1.3vh",
            lineHeight: "1.6",
            color: "#333",
          },
        }}>
          <ReactQuill 
            theme="snow"
            value={emailBody}
            onChange={setEmailBody}
            modules={{
              toolbar: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'align': [] }],
                [{ 'color': [] }, { 'background': [] }],
                ['link'],
                ['clean']
              ]
            }}
            formats={[
              'header',
              'bold', 'italic', 'underline', 'strike',
              'blockquote', 'code-block',
              'list', 'align',
              'color', 'background',
              'link'
            ]}
          />
        </Box>

        {/* ACTIONS */}
        <Box sx={styles.actions}>
          <Button onClick={() => navigate(-1)}>Cancel</Button>

          <Button
            variant="contained"
            startIcon={<MailOutlineOutlinedIcon />}
            sx={styles.sendButton}
            onClick={() => setShowConfirmDialog(true)}
          >
            Send Now
          </Button>
        </Box>
      </Box>

      {/* Confirmation Dialog */}
    <Dialog 
      open={showConfirmDialog} 
      onClose={() => setShowConfirmDialog(false)}
      PaperProps={{
        sx: {
          borderRadius: "1.5vh",
          maxWidth: "45vh"
        }
      }}
    >
      <DialogContent sx={{ padding: "3vh", textAlign: "center" }}>
        <Box sx={{ 
          width: "8vh", 
          height: "8vh", 
          borderRadius: "50%", 
          backgroundColor: "#ecf7f1",
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          margin: "0 auto 1.5vh"
        }}>
          <SendIcon sx={{ fontSize: "4vh", color: "#006b66" }} />
        </Box>
        <Typography sx={{ fontSize: "1.8vh", fontWeight: 700, marginBottom: "1vh", color: "#000" }}>
          Send Interview Invites
        </Typography>
        <Typography sx={{ fontSize: "1.3vh", color: "#6b7280", marginBottom: "2vh", lineHeight: 1.6 }}>
          You are about to send interview invitations to <span style={{ fontWeight: 700, color: "#000" }}>{recipients.length} candidates</span>
          <br />
          This action will initiate the technical evaluation process.
        </Typography>

        <Box sx={{ display: "flex", gap: "1.5vh", justifyContent: "center", marginTop: "2.5vh" }}>
          <Button
            variant="outlined"
            sx={{
              borderColor: "#e5e7eb",
              color: "#374151",
              textTransform: "none",
              fontSize: "1.3vh",
              fontWeight: 600,
              padding: "0.8vh 2vh",
              borderRadius: "0.8vh",
              "&:hover": {
                borderColor: "#d1d5db",
                backgroundColor: "#f9fafb"
              }
            }}
            onClick={() => setShowConfirmDialog(false)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{
              background: "#006b66",
              textTransform: "none",
              fontSize: "1.3vh",
              fontWeight: 600,
              padding: "0.8vh 2.5vh",
              borderRadius: "0.8vh",
              "&:hover": {
                background: "#006b66"
              }
            }}
            onClick={() => {
              setShowConfirmDialog(false);
              handleSendEmails();
            }}
          >
            Confirm & Send
          </Button>
        </Box>
      </DialogContent>
    </Dialog>

    {/* Sending Emails Dialog */}
    <Dialog 
      open={isSending}
      PaperProps={{
        sx: {
          borderRadius: "1.5vh",
          maxWidth: "40vh",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
        }
      }}
    >
      <DialogContent sx={{ padding: "3vh", textAlign: "center", minHeight: "12vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "1.5vh" }}>
          <CircularProgress 
            size={32} 
            sx={{ color: "#006b66" }} 
            thickness={4}
          />
          <Typography sx={{ fontSize: "1.6vh", fontWeight: 600, color: "#000" }}>
            Sending Emails
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
    </Box>
  );
};

export default SendEmail;

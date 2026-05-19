import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Button,
  Typography,
  Divider,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import PsychologyIcon from "@mui/icons-material/Psychology";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

interface CriteriaChoiceModalProps {
  open: boolean;
  onClose: () => void;
  onEnterCriteria: () => void;
  onUploadQuestionnaire: () => void;
}

const CriteriaChoiceModal: React.FC<CriteriaChoiceModalProps> = ({
  open,
  onClose,
  onEnterCriteria,
  onUploadQuestionnaire,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "2vh",
          maxWidth: "46vw",
          height: "auto",
        },
      }}
    >
      <DialogTitle
        sx={{
          padding: 0,
          background: "linear-gradient(90deg, #006b66 0%, #004d40 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            padding: "2.5vh 3vh",
            gap: "2vh",
          }}
        >
          {/* Brand Icon Box */}
          <Box
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              borderRadius: "1.2vh",
              padding: "1vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: "2.5vh", color: "white" }} />
          </Box>

          {/* Text Content */}
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              sx={{
                fontSize: "2.4vh",
                fontWeight: 700,
                lineHeight: 1.2,
                color: "white",
              }}
            >
              Choose Interview Configuration
            </Typography>
            <Typography
              sx={{
                fontSize: "1.4vh",
                opacity: 0.9,
                fontWeight: 400,
                color: "white",
              }}
            >
              Select how you want to evaluate candidates
            </Typography>
          </Box>

          {/* Close Button */}
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: "white",
              padding: "0.5vh",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <CloseIcon sx={{ fontSize: "2.2vh" }} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: "2vh" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: "2.5vh",
            justifyContent: "center",
            mb: "3vh",
            mt: "2vh",
          }}
        >
          {/* Questionnaire-Based Option */}
          <Button
            onClick={onUploadQuestionnaire}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              padding: "3vh",
              border: "0.2vh solid #e0e0e0",
              borderRadius: "2vh",
              backgroundColor: "#fff",
              transition: "all 0.3s ease",
              textTransform: "none",
              flex: 1,
              height: "33vh",
              position: "relative",
              "&:hover": {
                backgroundColor: "#fff",
                borderColor: "#991b1b",
                boxShadow: "0 0.8vh 2vh rgba(0,0,0,0.08)",
              },
            }}
          >
            {/* Badge */}
           
            <Box
              sx={{
                width: "5.5vh",
                height: "5.5vh",
                borderRadius: "1.2vh",
                background: "#991b1b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: "2vh",
                boxShadow: "0 0.4vh 1vh rgba(153, 27, 27, 0.15)",
              }}
            >
              <DescriptionOutlinedIcon  sx={{ fontSize: "2.8vh", color: "#ffffff" }} />
            </Box>

            <Typography sx={{ fontSize: "2.2vh", fontWeight: 700, color: "#111827", mb: "1vh" }}>
              Questionnaire-Based
            </Typography>
            <Typography sx={{ fontSize: "1.35vh", color: "#6B7280", textAlign: "left", lineHeight: 1.5, mb: "2vh" }}>
              Upload a question file or create your own set of interview questions.
            </Typography>

            {/* Feature List */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: "0.8vh", mb: "auto" }}>
              {[
                "Upload questions from a file (.doc,.xlxs, .pdf)",
                "Add and edit questions manually",
                "Customize questions for each role"
              ].map((text, i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "center", gap: "0.8vh" }}>
                  <CheckCircleOutlineIcon sx={{ fontSize: "1.6vh", color: "#059669" }} />
                  <Typography sx={{ fontSize: "1.3vh", color: "#4B5563" }}>{text}</Typography>
                </Box>
              ))}
            </Box>

            {/* Select Link */}
            <Box sx={{ alignSelf: "flex-end", display: "flex", alignItems: "center", gap: "0.5vh", color: "#991b1b" }}>
              <Typography sx={{ fontSize: "1.4vh", fontWeight: 700 }}>Select</Typography>
              <ArrowForwardIcon sx={{ fontSize: "1.6vh" }} />
            </Box>
          </Button>

          {/* Framework-Based Option */}
          <Button
            onClick={onEnterCriteria}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              padding: "3vh",
              border: "0.2vh solid #e0e0e0",
              borderRadius: "2vh",
              backgroundColor: "#fff",
              transition: "all 0.3s ease",
              textTransform: "none",
              flex: 1,
              height: "33vh",
              position: "relative",
              "&:hover": {
                backgroundColor: "#fff",
                borderColor: "#006b66",
                boxShadow: "0 0.8vh 2vh rgba(0,0,0,0.08)",
              },
            }}
          >
            {/* Badge */}
           
            <Box
              sx={{
                width: "5.5vh",
                height: "5.5vh",
                borderRadius: "1.2vh",
                background: "#e0f2f1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: "2vh",
                boxShadow: "0 0.4vh 1vh rgba(0, 107, 102, 0.15)",
              }}
            >
              <EditIcon sx={{ fontSize: "2.8vh", color: "#006b66" }} />
            </Box>

            <Typography sx={{ fontSize: "2.2vh", fontWeight: 700, color: "#111827", mb: "1vh" }}>
              Criteria-Based
            </Typography>
            <Typography sx={{ fontSize: "1.35vh", color: "#6B7280", textAlign: "left", lineHeight: 1.5, mb: "2vh" }}>
              Evaluate candidates using structured competency frameworks and evaluation criteria.
            </Typography>

            {/* Feature List */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: "0.8vh", mb: "auto" }}>
              {[
                "Create or use AI-generated criteria",
                "Auto-generate evaluation criteria description",
               
              ].map((text, i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "center", gap: "0.8vh" }}>
                  <CheckCircleOutlineIcon sx={{ fontSize: "1.6vh", color: "#059669" }} />
                  <Typography sx={{ fontSize: "1.3vh", color: "#4B5563" }}>{text}</Typography>
                </Box>
              ))}
            </Box>

            {/* Select Link */}
            <Box sx={{ alignSelf: "flex-end", display: "flex", alignItems: "center", gap: "0.5vh", color: "#006b66" }}>
              <Typography sx={{ fontSize: "1.4vh", fontWeight: 700 }}>Select</Typography>
              <ArrowForwardIcon sx={{ fontSize: "1.6vh" }} />
            </Box>
          </Button>
        </Box>

        {/* Info Box */}
        <Box
          sx={{
            display: "flex",
            gap: "1.5vh",
            backgroundColor: "#F3F4F6",
            borderRadius: "1.5vh",
            padding: "2vh",
            mt: "1vh",
            alignItems: "flex-start",
            border: "1px solid #E5E7EB",
          }}
        >
          <Box
            sx={{
              backgroundColor: "white",
              borderRadius: "0.8vh",
              padding: "0.6vh",
              border: "1px solid #E5E7EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PsychologyIcon sx={{ fontSize: "2.5vh", color: "#059669" }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "1.5vh", fontWeight: 700, color: "#374151", mb: "0.4vh" }}>
              Not sure which to choose?
            </Typography>
            <Typography sx={{ fontSize: "1.35vh", color: "#4B5563", lineHeight: 1.5 }}>
              <strong>Questionnaire-Based - </strong> Create or upload your own questions. 
            </Typography>
             <Typography sx={{ fontSize: "1.35vh", color: "#4B5563", lineHeight: 1.5 }}>
             <strong>Criteria-Based</strong> is best when you want to define criteria and generate the interview flow from AI-suggested or custom criteria.
            </Typography>
          </Box>
        </Box>
      </DialogContent>

    </Dialog>
  );
};

export default CriteriaChoiceModal;

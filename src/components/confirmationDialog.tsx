import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
} from "@mui/material";
import Text from "./textComponent";

import { globalStyles } from "../config";
import CustomButton from "./button";
import { Close } from "@mui/icons-material";

interface ConfirmationDialogProps {
  open: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  title: React.ReactNode;
  confirmText?: string | null;
  cancelText?: string | null;
  message?: any;
  AdditionalButtonText?: string;
  OnAddtionalClick?: any;
  maxWidth?: string;
  children?: React.ReactNode;
  disableButton?: any;
  additionalStyles?: any;
  showActions?: boolean;
  closeIcon?: boolean
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  maxWidth,
  children,
  OnAddtionalClick,
  AdditionalButtonText,
  disableButton,
  additionalStyles,
  showActions,
  closeIcon
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      disableEscapeKeyDown
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "0.7vh",
          maxWidth: maxWidth,

        },
      }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(108deg, #004d40 0%, #00605a 45%, #004d40 100%)",
          padding: "2vh",
          fontWeight: "bold",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "0.1vh solid #ddd",
          fontSize: "2.5vh",
          color: "white",
          marginBottom: "1vh",
        }}
      >
        <Text
          text={title}
          variant="heading"
          styles={{ color: "white", fontSize: "2.1vh" }}
        />
        {closeIcon && (<Close onClick={onClose} sx={{ cursor: "pointer" }} />
        )}
      </DialogTitle>
      <DialogContent
        sx={{
          marginLeft: "-1vh",
          padding: "0vh 2vh 0vh 3vh",
          marginTop: "0vh",
          ...additionalStyles,
        }}
      >
        {message && (
          <Text
            text={message}
            variant="heading"
            color="light"
            styles={{ fontSize: "1.8vh" }}
          />
        )}
        {children} {/* Render custom content like SurveyContent */}
      </DialogContent>
      {showActions !== false && (
        <DialogActions
          sx={{
            display: "flex",
            padding: "1vh",
            justifyContent: "space-between",
            alignItems: "center",
            "@media (max-device-width: 480px)": {
              flexDirection: "column-reverse",
            },
          }}
        >
          <Box sx={{ lineHeight: "3vh" }}>
            {AdditionalButtonText && (
              <CustomButton
                text={AdditionalButtonText}
                onClick={OnAddtionalClick}
                type="tertiary"
                additionalStyles={{ height: "3.5vh", fontSize: "1.8vh" }}
              />
            )}
          </Box>
          <Box
            display="flex"
            justifyContent="flex-end"
            gap={"1vh"}
            sx={{
              "@media (max-device-width: 480px)": {
                flexDirection: "column-reverse",
                width: "90%",
              },
            }}
          >
            {cancelText === null ? null : (
              <CustomButton
                text={cancelText || "Cancel"}
                onClick={onClose}
                type="secondary"
                additionalStyles={{ height: "3.5vh", width: "5vw", fontSize: "1.7vh", color: "#FFFFFF", backgroundColor: "#00695C", borderColor: "#00695C" }}
              />
            )}
            {confirmText && (
              <CustomButton
                text={confirmText}
                onClick={onConfirm}
                type="primary"
                disabled={disableButton}
                additionalStyles={{ height: "3.5vh", width: "5vw", fontSize: "1.7vh", color: "#FFFFFF", backgroundColor: "#00695C", borderColor: "#00695C" }}
              />
            )}
          </Box>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default ConfirmationDialog;
import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface CustomDialogProps {
  open: boolean;
  title: string;
  primaryText?: string;
  secondaryText?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  children: React.ReactNode;
  handleClose: () => void;
}

const CustomDialog: React.FC<CustomDialogProps> = ({
  open,
  title,
  primaryText,
  secondaryText,
  onPrimaryClick,
  onSecondaryClick,
  handleClose,
  children,
}) => {

  return (
    <Dialog
      open={open}
      sx={{ zIndex: 10001 }}
      onClose={(event, reason) => {
        // Only allow closing via escape key or close button, not backdrop click
        if (reason === 'backdropClick') {
          return;
        }
        handleClose();
      }}
      maxWidth="sm"
      fullWidth
    >
      <Box sx={{ background: "linear-gradient(108deg, #004d40 0%, #00605a 45%, #004d40 100%)", color: 'white', p: 2, position: 'relative' }}>
        <DialogTitle sx={{ p: 0, fontWeight: 500, fontSize: "2.8vh", fontFamily: 'Barlow' }}>{title}</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent sx={{ pt: 3, pb: 1 }}>
        {children}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'flex-end', pb: 3, pr: 3 }}>
        {secondaryText && (
          <Button onClick={onSecondaryClick} variant="outlined" sx={{ borderColor: '#8B1C1C', color: '#8B1C1C', mr: 1, borderRadius: 2 }}>
            {secondaryText}
          </Button>
        )}
        {primaryText && (
          <Button onClick={onPrimaryClick} variant="contained" sx={{ background: '#8B1C1C', borderRadius: 2 }}>
            {primaryText}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CustomDialog;

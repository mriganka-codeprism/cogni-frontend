import React from 'react';
import { Dialog, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';
import { globalStyles } from '../../../config';

interface FullscreenWarningModalProps {
  open: boolean;
  onReturnToFullscreen: () => void;
}

const FullscreenWarningModal: React.FC<FullscreenWarningModalProps> = ({
  open,
  onReturnToFullscreen,
}) => {
  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      onClose={() => {}}
      disableEscapeKeyDown={true}
      disableEnforceFocus={true}
      autoFocus={false}
      keepMounted={true}
      PaperProps={{
        sx: {
          borderRadius: '2.5vh',
          boxShadow: '0 10px 50px rgba(0,0,0,0.4)',
        },
      }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(0,0,0,0.55)',
          },
        },
      }}
    >
      {/* Custom Header with Primary Color */}
      <Box
        sx={{
          background: globalStyles.colors.primary,
          color: 'white',
          p: '2.4vh',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            fontSize: '2.2vh',
            fontFamily: globalStyles.fonts.heading,
            letterSpacing: '0.5px',
            margin: 0,
          }}
        >
          ⚠️ Full Screen Mode Required
        </Typography>
      </Box>

      {/* Main Content */}
      <DialogContent
        sx={{
          p: '2.4vh 2.4vh 2vh 2.4vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.4vh',
          minHeight: 'auto',
        }}
      >
        <Typography
          sx={{
            fontSize: '1.6vh',
            fontWeight: 600,
            color: globalStyles.colors.darkText,
            fontFamily: globalStyles.fonts.body,
          }}
        >
          You have exited full screen mode!
        </Typography>

        <Typography
          sx={{
            fontSize: '1.4vh',
            color: globalStyles.colors.lightText,
            lineHeight: 1.7,
            fontFamily: globalStyles.fonts.body,
          }}
        >
          The interview must be conducted in full screen mode only.
        </Typography>

        {/* Warning Alert Box */}
        <Box
          sx={{
            backgroundColor: '#fce4ec',
            border: '0.2vh solid #c2185b',
            borderRadius: '0.8vh',
            padding: '1.2vh 1.4vh',
            display: 'flex',
            gap: '0.8vh',
            alignItems: 'flex-start',
          }}
        >
          <Typography
            sx={{
              fontSize: '1.6vh',
              color: '#c2185b',
              fontWeight: 'bold',
              mt: '0.2vh',
              flexShrink: 0,
            }}
          >
            ⚠️
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.4vh' }}>
            <Typography
              sx={{
                fontSize: '1.3vh',
                fontWeight: 700,
                color: '#c2185b',
                fontFamily: globalStyles.fonts.body,
                margin: 0,
              }}
            >
              This is your FIRST warning
            </Typography>
            <Typography
              sx={{
                fontSize: '1.3vh',
                fontWeight: 600,
                color: '#c2185b',
                fontFamily: globalStyles.fonts.body,
                margin: 0,
              }}
            >
              One more exit will end your interview
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      {/* Action Button */}
      <DialogActions
        sx={{
          p: '2.4vh',
          justifyContent: 'center',
        }}
      >
        <Button
          onClick={onReturnToFullscreen}
          variant="contained"
          sx={{
            backgroundColor: globalStyles.colors.primary,
            color: globalStyles.colors.buttonText,
            fontSize: '1.5vh',
            fontWeight: 700,
            padding: '1.2vh 3.2vh',
            borderRadius: '1.2vh',
            fontFamily: globalStyles.fonts.body,
            textTransform: 'none',
            width: '100%',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: '#6b110f',
              boxShadow: '0 6px 20px rgba(134, 22, 27, 0.35)',
              transform: 'translateY(-0.2vh)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          }}
        >
          Return to Full Screen Mode
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FullscreenWarningModal;

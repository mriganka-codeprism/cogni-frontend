import * as React from "react";
import CustomDialog from "../../customDialog";

interface EndCountdownDialogProps {
  endWebinarHandler: () => void;
  initialSeconds?: number;
}

export default function EndCountdownDialog({
  endWebinarHandler,
  initialSeconds = 4,
}: EndCountdownDialogProps) {
  const [secondsLeft, setSecondsLeft] = React.useState(initialSeconds);

  React.useEffect(() => {
    if (secondsLeft <= 0) return;
    const intervalId = window.setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [secondsLeft]);

  React.useEffect(() => {
    if (secondsLeft <= 0) {
      endWebinarHandler();
    }
  }, [secondsLeft, endWebinarHandler]);

  return (
    <CustomDialog
      open
      title="Ending Interview"
      handleClose={() => {}}
      onPrimaryClick={() => {}}
    >
     You’ve reached the end of your interview.<br/>
     This session will close in {secondsLeft} seconds.
    </CustomDialog>
  );
}



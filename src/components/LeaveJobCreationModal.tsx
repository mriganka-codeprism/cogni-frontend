import React, { useState } from "react";
import {
    Dialog,
    Box,
    Typography,
    IconButton,
    Button,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";
import { leaveModalStyles } from "../styles/LeaveJobCreationModal.styles";
import BookmarkCheck from "../assets/images/BookmarkCheck.png";
import Trash2 from "../assets/images/Trash2.png";

interface LeaveJobCreationModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (action: "save" | "delete") => void;
}

const LeaveJobCreationModal = ({
    open,
    onClose,
    onConfirm,
}: LeaveJobCreationModalProps) => {
    const [selectedOption, setSelectedOption] = useState<"save" | "delete" | null>(
        null
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: leaveModalStyles.dialogPaper,
            }}
        >
            <IconButton sx={leaveModalStyles.closeIcon} onClick={onClose}>
                <CloseIcon />
            </IconButton>

            <Box sx={leaveModalStyles.header}>
                <Box sx={leaveModalStyles.warningIconBox}>
                    <WarningAmberRoundedIcon sx={{ fontSize: "2.5vh" }} />
                </Box>
                <Box>
                    <Typography sx={leaveModalStyles.title}>Leave Job Creation?</Typography>
                    <Typography sx={leaveModalStyles.subtitle}>
                        This job post has unsaved changes
                    </Typography>
                </Box>
            </Box>

            <Typography sx={leaveModalStyles.description}>
                You're leaving before publishing. What would you like to do with your progress?
            </Typography>

            <Box
                sx={leaveModalStyles.optionCard(selectedOption === "save", "save")}
                onClick={() => {
                    setSelectedOption("save");
                    onConfirm("save");
                }}
            >
                <Box sx={leaveModalStyles.optionIconBox("save")}>
                    <img src={BookmarkCheck} alt="" style={{ height: "2vh", width: "auto" }} />
                </Box>
                <Box sx={leaveModalStyles.optionContent}>
                    <Typography sx={leaveModalStyles.optionTitle}>Save as Draft</Typography>
                    <Typography sx={leaveModalStyles.optionSubtitle}>
                        Your progress will be saved. Continue later from Drafts in the sidebar.
                    </Typography>
                </Box>
                <Box sx={leaveModalStyles.radioCircle(selectedOption === "save", "save")} />
            </Box>

            <Box
                sx={leaveModalStyles.optionCarddelete(selectedOption === "delete", "delete")}
                onClick={() => {
                    setSelectedOption("delete");
                    onConfirm("delete");
                }}
            >
                <Box sx={leaveModalStyles.optionIconBox("delete")}>
                    <img src={Trash2} alt="" style={{ height: "2vh", width: "auto" }} />
                </Box>
                <Box sx={leaveModalStyles.optionContent}>
                    <Typography sx={leaveModalStyles.optionTitledelete}>Exit Editing</Typography>
                    <Typography sx={leaveModalStyles.optionSubtitle}>
                        Permanently discard all progress on this job post.
                    </Typography>
                </Box>
                <Box sx={leaveModalStyles.radioCircledelete(selectedOption === "delete", "delete")} />
            </Box>

            <Button
                variant="text"
                sx={leaveModalStyles.keepEditingBtn}
                onClick={onClose}
                disableRipple
            >
                Keep editing
            </Button>
        </Dialog>
    );
};

export default LeaveJobCreationModal;

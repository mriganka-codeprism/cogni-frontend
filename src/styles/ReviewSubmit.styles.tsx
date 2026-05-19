export const styles = {
  container: {
    width: "100%",
    height: "100%",
    // backgroundColor: "#f5f5f5",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    fontFamily: "Poppins, sans-serif",
  },

  /* ---------- HEADER SECTION ---------- */
  headerSection: {
    background: "linear-gradient(108deg, #004d40 0%, #00605a 45%, #004d40 100%)",
    color: "#fff",
    padding: "2vh 1.5vw",
    display: "flex",
    alignItems: "flex-start",
    gap: "2vw",
    borderRadius: "1.5vh",
    margin: "1vh 1vw",
    flexShrink: 0,
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 1vh 3vh rgba(0,77,64,0.15)",
    height: "12vh",
    "&::before": {
      content: '""',
      position: "absolute",
      top: "-50%",
      left: "-10%",
      width: "60vh",
      height: "60vh",
      background: "radial-gradient(circle, rgba(0,181,173,0.15) 0%, transparent 70%)",
      pointerEvents: "none",
    },
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: "-40%",
      right: "-5%",
      width: "50vh",
      height: "50vh",
      background: "radial-gradient(circle, rgba(0,181,173,0.12) 0%, transparent 70%)",
      pointerEvents: "none",
    }
  },

  headerContent: {
    display: "flex",
    flexDirection: "column",
    gap: "1.2vh", // Increased gap for more spacing
    flex: 1,
    zIndex: 1,
  },

  headerBadge: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.8vh",
    fontSize: "1.2vh",
    fontWeight: 700,
    color: "rgba(255,255,255,0.9)",
    fontFamily: "Poppins, sans-serif",
    //  padding: "0.8vh 1.4vh",
    // backgroundColor: "rgba(255,255,255,0.08)",
    //  border: "0.15vh solid rgba(255,255,255,0.2)",
    // borderRadius: "10vh",
    width: "fit-content",
    letterSpacing: "0.05vh",
  },

  headerTitle: {
    fontSize: "2vh",
    fontWeight: 800,
    color: "#fff",
    lineHeight: 1.2,
    letterSpacing: "0.05vh", // Remove negative letterSpacing
    fontFamily: "Poppins, sans-serif",
  },

  headerTags: {
    display: "flex",
    gap: "1vh",
    marginTop: "0.5vh",
  },

  headerTag: {
    display: "flex",
    alignItems: "center",
    gap: "0.8vh",
    fontSize: "1.3vh",
    fontWeight: 600,
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: "0.1vh 1vh",
    borderRadius: "10vh",
    color: "#fff",
    border: "0.15vh solid rgba(255,255,255,0.15)",
    backdropFilter: "blur(0.4vh)",
    fontFamily: "Poppins, sans-serif",
  },

  headerModeContainer: {
    textAlign: "right",
    zIndex: 1,
    // paddingRight: "1vw",
    marginTop: "0.2vh",
  },

  headerModeLabel: {
    fontSize: "1.1vh",
    fontWeight: 700,
    color: "rgba(255,255,255,0.6)",
    textTransform: "uppercase",
    letterSpacing: "0.1vh",
    marginBottom: "0.4vh",
    fontFamily: "Poppins, sans-serif",
  },

  headerMode: {
    fontSize: "1.5vh",
    fontWeight: 800,
    color: "#fff",
    fontFamily: "Poppins, sans-serif",
  },

  /* ---------- SCROLLABLE CONTENT ---------- */
  content: {
    flex: 1,
    overflowY: "auto",
    scrollbarWidth: "thin",
    padding: "0 0.5vw 2vh 1vw",
    display: "flex",
    flexDirection: "column",
    gap: "1.5vh",
    paddingTop: "1.5vh",
  },

  /* ---------- SECTION CARD ---------- */
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: "1.6vh",
    padding: "1vh 1.5vw",
    border: "0.15vh solid #e5e7eb",
    boxShadow: "0 0.5vh 2.5vh rgba(0,0,0,0.02)",
    // marginBottom: "2vh",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "1.5vh",
    marginBottom: "1vh",
    justifyContent: "space-between",
  },

  sectionDivider: {
    height: "0.15vh",
    backgroundColor: "#f3f4f6",
    margin: "0 -1.5vw 1vh -1.5vw",
  },

  sectionIconBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "3.5vh",
    height: "3.5vh",
    backgroundColor: "rgba(0,107,102,0.05)",
    borderRadius: "1vh",
    color: "#006b66",
    flexShrink: 0,
  },

  sectionTitleBox: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4vh",
    flex: 1,
  },

  sectionTitle: {
    fontSize: "1.8vh",
    fontWeight: 700,
    color: "#111827",
    fontFamily: "Poppins, sans-serif",
  },

  sectionSubtitle: {
    fontSize: "1.3vh",
    fontWeight: 400,
    color: "#9ca3af",
    fontFamily: "Poppins, sans-serif",
  },

  sectionEditBtn: {
    border: "0.15vh solid #e5e7eb",
    backgroundColor: "#fff",
    color: "#4b5563",
    fontSize: "1.3vh",
    padding: "0vh 1vh",
    borderRadius: "1vh",
    cursor: "pointer",
    textTransform: "none",
    fontWeight: 600,
    fontFamily: "Poppins, sans-serif",
    minWidth:"10vh",
    // gap: "1vh",
    "&:hover": {
      backgroundColor: "#f9fafb",
      borderColor: "#d1d5db",
    },
    "& .MuiButton-startIcon": {
      marginRight: "0.5vh",
    }
  },

  /* ---------- CONTENT ROWS ---------- */
  detailRow: {
    display: "flex",
    flexDirection: "column",
    gap: "1vh",
    marginBottom: "2vh",
  },

  label: {
    fontSize: "1.1vh",
    fontWeight: 700,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.08vh",
    fontFamily: "Poppins, sans-serif",
  },

  value: {
    fontSize: "1.4vh",
    //fontWeight: 600,
    color: "#111827",
    lineHeight: 1.5,
    fontFamily: "Poppins, sans-serif",
  },

  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "3vw",
    marginBottom: "3vh",
  },

  gridItem: {
    display: "flex",
    flexDirection: "column",
    gap: "1vh",
  },

  gridItemLabel: {
    fontSize: "1.1vh",
    fontWeight: 700,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.08vh",
    fontFamily: "Poppins, sans-serif",
  },

  gridItemValue: {
    fontSize: "1.4vh",
    fontFamily: "Poppins, sans-serif",
    //fontWeight: 600,
    color: "#111827",
  },

  progressBar: {
    width: "100%",
    height: "0.6vh",
    backgroundColor: "#e5e7eb",
    borderRadius: "1vh",
    overflow: "hidden",
    marginBottom: "0.5vh",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#dc2626",
    transition: "width 0.3s ease",
  },

  progressLabel: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5vh",
  },

  progressLabelText: {
    fontSize: "1.1vh",
    fontWeight: 600,
    color: "#6b7280",
    textTransform: "uppercase",
    fontFamily: "Poppins, sans-serif",
  },

  progressValue: {
    fontSize: "1.3vh",
    fontWeight: 700,
    color: "#dc2626",
    fontFamily: "Poppins, sans-serif",
  },

  weightGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "1.5vh",
  },

  weightItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.6vh",
    padding: "1.2vh",
    backgroundColor: "#f9fafb",
    borderRadius: "0.8vh",
    border: "0.1vh solid #e5e7eb",
  },

  weightValue: {
    fontSize: "1.8vh",
    fontWeight: 700,
    color: "#006b66",
    fontFamily: "Poppins, sans-serif",
  },

  weightLabel: {
    fontSize: "1vh",
    fontWeight: 600,
    color: "#6b7280",
    textAlign: "center",
    textTransform: "uppercase",
    fontFamily: "Poppins, sans-serif",
  },

  /* ---------- FILE ITEM ---------- */
  fileItem: {
    display: "flex",
    alignItems: "center",
    gap: "1.2vh",
    padding: "1.2vh",
    backgroundColor: "#f9fafb",
    borderRadius: "0.8vh",
    border: "0.1vh solid #e5e7eb",
  },

  fileIcon: {
    fontSize: "2vh",
    color: "#006b66",
    flexShrink: 0,
  },

  fileInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "0.2vh",
    flex: 1,
  },

  fileName: {
    fontSize: "1.2vh",
    fontWeight: 600,
    color: "#111827",
    fontFamily: "Poppins, sans-serif",
  },

  fileStatus: {
    fontSize: "1vh",
    fontWeight: 400,
    color: "#9ca3af",
    fontFamily: "Poppins, sans-serif",
  },

  /* ---------- CRITERIA LIST ---------- */
  criteriaList: {
    display: "flex",
    flexDirection: "column",
    gap: "1.2vh",
  },

  criteriaItem: {
    display: "flex",
    gap: "1.2vh",
    padding: "1.2vh",
    // backgroundColor: "#f9fafb",
    borderRadius: "0.8vh",
    // border: "0.1vh solid #e5e7eb",
    alignItems: "flex-start",
  },

  criteriaNumber: {
    fontSize: "1.2vh",
    fontWeight: 700,
    color: "#006b66",
    minWidth: "1.5vh",
    flexShrink: 0,
    marginTop: "0.1vh",
    fontFamily: "Poppins, sans-serif",
  },

  criteriaContent: {
    display: "flex",
    flexDirection: "column",
    gap: "0.3vh",
    flex: 1,
  },

  criteriaTitle: {
    fontSize: "1.4vh",
    fontWeight: 600,
    color: "#111827",
    fontFamily: "Poppins, sans-serif",
  },

  criteriaDescription: {
    fontSize: "1.4vh",
    fontWeight: 400,
    color: "#111827",
    lineHeight: "1.5",
    fontFamily: "Poppins, sans-serif",
  },

  /* ---------- WARNING BANNER ---------- */
  warningBanner: {
    backgroundColor: "#fef3c7",
    border: "0.1vh solid #fcd34d",
    borderRadius: "0.8vh",
    padding: "1.2vh 1.5vh",
    display: "flex",
    gap: "1.2vh",
    alignItems: "flex-start",
    margin: "1.5vh 0.1vh",
    flexShrink: 0,
  },

  warningIcon: {
    fontSize: "2vh",
    fontFamily: "Poppins, sans-serif",
    color: "#f59e0b",
    flexShrink: 0,
    marginTop: "0.1vh",
  },

  warningContent: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4vh",
    flex: 1,
  },

  warningTitle: {
    fontSize: "1.2vh",
    fontWeight: 700,
    color: "#92400e",
    fontFamily: "Poppins, sans-serif",
  },

  warningText: {
    fontSize: "1.1vh",
    fontWeight: 400,
    color: "#b45309",
    lineHeight: "1.4",
    fontFamily: "Poppins, sans-serif",
  },

  /* ---------- FOOTER ---------- */
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.5vh 1vw",
    // borderTop: "0.15vh solid #e5e7eb",
    backgroundColor: "#fff",
    flexShrink: 0,
    marginTop: "auto",
  },

  backButton: {
    border: "0.15vh solid #006B66",
    color: "#006B66",
    backgroundColor: "#fff",
    fontSize: "1.4vh",
    padding: "0.2vh 0.2vh",
    borderRadius: "0.5vh",
    textTransform: "none",
    fontWeight: 300,
    fontFamily: "Poppins, sans-serif",
    minWidth:"6.4vh",
    "&:hover": {
      backgroundColor: "rgba(0,107,102,0.05)",
      borderColor: "#005752",
    },
  },

  createButton: {
    backgroundColor: "#006B66",
    color: "#fff",
    fontSize: "1.4vh",
    padding: "0.2vh 2vh",
    borderRadius: "0.5vh",
    textTransform: "none",
    fontFamily: "Poppins, sans-serif",
    minWidth:"10vh",
    // fontWeight: 700,
    "&:hover": {
      backgroundColor: "#005752",
    },
  },

  publishButton: {
    backgroundColor: "#006B66",
    color: "#fff",
    fontSize: "1.8vh",
    padding: "1.2vh 4vh",
    borderRadius: "1.2vh",
    textTransform: "none",
    fontWeight: 700,
    "&:hover": {
      backgroundColor: "#005752",
    },
  },

  /* ---------- EDIT MODE CONTROLS ---------- */
  editButtonContainer: {
    display: "flex",
    gap: "1.2vh",
  },

  cancelButton: {
    backgroundColor: "#fff",
    color: "#6b7280",
    border: "0.15vh solid #e5e7eb",
    fontSize: "1.3vh",
    padding: "0vh 2vh",
    borderRadius: "0.8vh",
    textTransform: "none",
    fontWeight: 700,
    height: "3vh",
    minWidth:"10vh",
    width: "10vh",
    fontFamily: "Poppins, sans-serif",
    // gap: "0.8vh",
    "&:hover": {
      backgroundColor: "#f9fafb",
    },
  "& .MuiButton-startIcon": {
    display: "inherit",
    marginRight: "1vh",   // 8px ≈ 1vh
  },

  },

  saveButton: {
    backgroundColor: "#006B66",
    color: "#fff",
    fontSize: "1.3vh",
    padding: "0vh 2vh",
    borderRadius: "0.8vh",
    textTransform: "none",
    fontWeight: 700,
    height: "3vh",
    width: "8vh",
    fontFamily: "Poppins, sans-serif",
    minWidth:"10vh",
    // gap: "0.8vh",
    "&:hover": {
      backgroundColor: "#005752",
    },
    "&.Mui-disabled": {
      backgroundColor: "#f3f4f6",
      color: "#9ca3af",
      borderColor: "#e5e7eb",
    },
   
  "& .MuiButton-startIcon": {
    display: "inherit",
    marginRight: "1vh",   // 8px ≈ 1vh
  },

  },

  /* ---------- EDITABLE INPUTS ---------- */
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    //gap: "1.5vh",
    width: "100%",
  },

  inputLabelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  inputLabel: {
    fontSize: "1.2vh",
    fontWeight: 700,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.05vh",
    fontFamily: "Poppins, sans-serif",
  },

  requiredAsterisk: {
    color: "#dc2626",
    marginLeft: "0.4vh",
  },

  charCount: {
    fontSize: "1.2vh",
    color: "#9ca3af",
    fontWeight: 500,
    fontFamily: "Poppins, sans-serif",
  },

  textInput: {
    width: "100%",
    padding: "1.5vh 2vh",
    fontSize: "1.4vh",
    color: "#111827",
    border: "0.15vh solid #e5e7eb",
    borderRadius: "1.2vh",
    fontFamily: "Poppins, sans-serif",
    "&:focus": {
      outline: "none",
      borderColor: "#006B66",
      boxShadow: "0 0 0 0.2vh rgba(0,107,102,0.1)",
    },
  },

  textArea: {
    width: "100%",
    minHeight: "15vh",
    padding: "2vh",
    fontSize: "1.4vh",
    color: "#111827",
    border: "0.15vh solid #e5e7eb",
    borderRadius: "1.2vh",
    fontFamily: "Poppins, sans-serif",
    resize: "vertical",
    lineHeight: "1.6",
    "&:focus": {
      outline: "none",
      borderColor: "#006B66",
      boxShadow: "0 0 0 0.2vh rgba(0,107,102,0.1)",
    },
  },
  errorInput: {
    borderColor: "#dc2626 !important",
    borderWidth: "0.2vh !important",
  },


  /* ---------- CRITERIA EDIT MODE ---------- */
  criterionEditCard: {
    padding: "2.5vh",
    border: "0.15vh solid #f1f5f9",
    borderRadius: "1.6vh",
    marginBottom: "2.5vh",
    display: "flex",
    flexDirection: "column",
    gap: "2vh",
  },

  criterionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.5vh",
  },

  criterionLabel: {
    display: "flex",
    alignItems: "center",
    gap: "1.2vh",
    fontSize: "1.1vh",
    fontWeight: 700,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.08vh",
    fontFamily: "Poppins, sans-serif",
  },

  criterionCircle: {
    width: "2.4vh",
    height: "2.4vh",
    borderRadius: "50%",
    backgroundColor: "rgba(0,107,102,0.1)",
    color: "#006b66",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.2vh",
    fontWeight: 800,
    fontFamily: "Poppins, sans-serif",
  },

  deleteIconBtn: {
    color: "#d1d5db",
    padding: "0.5vh",
    "&:hover": {
      color: "#ef4444",
      backgroundColor: "rgba(239,68,68,0.05)",
    },
  },

  aiGenerateBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.8vh",
    color: "#8b5cf6",
    fontSize: "1.2vh",
    fontWeight: 700,
    textTransform: "none",
    fontFamily: "Poppins, sans-serif",
    padding: 0,
    minWidth: "0vh",
    "&:hover": {
      backgroundColor: "transparent",
      color: "#7c3aed",
    },
  },

  addCriterionBtn: {
    width: "100%",
    padding: "1vh",
    border: "0.2vh solid #f1f5f9",
    borderRadius: "1.6vh",
    backgroundColor: "#fff",
    color: "#9ca3af",
    fontSize: "1.4vh",
    fontWeight: 600,
    textTransform: "none",
    fontFamily: "Poppins, sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "1vh",
    marginTop: "1vh",
    "&:hover": {
      backgroundColor: "#f8fafc",
      borderColor: "#e2e8f0",
      color: "#64748b",
    },
  },
  /* ---------- ROLE DETAILS EDIT MODE ---------- */
  radioGroup: {
    display: "flex",
    gap: "3vh",
    marginTop: "1vh",
    marginBottom: "2vh",
  },

  radioItem: {
    display: "flex",
    alignItems: "center",
    gap: "1vh",
    cursor: "pointer",
  },

  radioCircle: {
    width: "2.2vh",
    height: "2.2vh",
    borderRadius: "50%",
    border: "0.2vh solid #d1d5db",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    "&.selected": {
      borderColor: "#006b66",
      borderWidth: "0.6vh",
    },
  },

  radioLabel: {
    fontSize: "1.4vh",
    fontWeight: 500,
    color: "#4b5563",
    fontFamily: "Poppins, sans-serif",
  },

  selectField: {
    width: "100%",
    padding: "1.2vh 2vh",
    fontSize: "1.4vh",
    color: "#111827",
    border: "0.15vh solid #e5e7eb",
    borderRadius: "1.2vh",
    fontFamily: "Poppins, sans-serif",
    appearance: "none",
    "-webkit-appearance": "none",
    "-moz-appearance": "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 2vh center",
    backgroundSize: "1.8vh",
    "&:focus": {
      outline: "none",
      borderColor: "#006B66",
      boxShadow: "0 0 0 0.2vh rgba(0,107,102,0.1)",
    },
  },
  /* ---------- ATS CONFIGURATION EDIT MODE ---------- */
  sliderContainer: {
    padding: "2vh 0",
    position: "relative",
  },

  sliderTrack: {
    height: "0.8vh",
    width: "100%",
    backgroundColor: "#f3f4f6",
    borderRadius: "1vh",
    position: "relative",
  },

  sliderFill: {
    height: "100%",
    backgroundColor: "#991b1b",
    borderRadius: "1vh",
  },

  sliderThumb: {
    width: "2vh",
    height: "2vh",
    backgroundColor: "#991b1b",
    borderRadius: "50%",
    position: "absolute",
    top: "50%",
    transform: "translate(-50%, -50%)",
    boxShadow: "0 0.5vh 1.5vh rgba(153,27,27,0.3)",
    cursor: "pointer",
  },

  sliderValueLabel: {
    position: "absolute",
    top: "-3vh",
    transform: "translateX(-50%)",
    fontSize: "1.4vh",
    fontWeight: 800,
    color: "#991b1b",
    fontFamily: "Poppins, sans-serif",
  },

  atsWeightGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "2vh",
    marginTop: "2vh",
  },

  atsWeightEditCard: {
    padding: "0.5vh 0.5vw",
    backgroundColor: "#f8fafc",
    borderRadius: "1.6vh",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "0.15vh solid #f1f5f9",
  },

  weightTitle: {
    fontSize: "1.4vh",
    fontWeight: 700,
    color: "#475569",
    fontFamily: "Poppins, sans-serif",
  },

  stepperContainer: {
    display: "flex",
    alignItems: "center",
    gap: "1.5vh",
    backgroundColor: "#fff",
    padding: "0.5vh 1vh",
    borderRadius: "1vh",
    border: "0.15vh solid #e2e8f0",
  },

  stepperBtn: {
    minWidth: "3vh",
    height: "3vh",
    borderRadius: "0.6vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: "1.8vh",
    fontWeight: 600,
    fontFamily: "Poppins, sans-serif",
    "&:hover": {
      backgroundColor: "#f1f5f9",
      color: "#64748b",
    },
  },

  stepperValue: {
    fontSize: "1.6vh",
    fontWeight: 800,
    color: "#1e293b",
    minWidth: "2vh",
    textAlign: "center",
    fontFamily: "Poppins, sans-serif",
  },

  sumBadge: {
    display: "inline-flex",
    padding: "0.6vh 1.5vh",
    borderRadius: "10vh",
    fontSize: "1.2vh",
    fontWeight: 800,
    fontFamily: "Poppins, sans-serif",
    "&.valid": {
      backgroundColor: "#ecfdf5",
      color: "#059669",
    },
    "&.invalid": {
      backgroundColor: "#fef2f2",
      },
  },

  addCategoryContainer: {
    padding: "1vh 1vh",
    borderTop: "0.15vh solid #eee",
    display: "flex",
    gap: "1vh",
    alignItems: "center",
    backgroundColor: "#fff",
    position: "sticky",
    bottom: 0,
    zIndex: 1,
  },
  addCategoryInput: {
    flex: 1,
    border: "0.15vh solid #ddd",
    borderRadius: "0.4vh",
    padding: "0.5vh 1vh",
    fontSize: "1.3vh",
    outline: "none",
    fontFamily: "Poppins, sans-serif",
    "&:focus": {
      borderColor: "#006B66",
    },
  },
  addCategoryBtn: {
    color: "#006B66",
    fontSize: "1.3vh",
    fontWeight: 700,
    cursor: "pointer",
    padding: "0.5vh 1vh",
    "&:hover": {
      backgroundColor: "rgba(0, 107, 102, 0.04)",
      borderRadius: "0.4vh",
    },
  },
  deleteMenuItem: {
    marginLeft: "auto",
    color: "#900B09",
    cursor: "pointer",
    fontSize: "1.4vh",
    padding: "0.2vh 0.5vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "&:hover": {
      backgroundColor: "rgba(144, 11, 9, 0.04)",
      borderRadius: "0.4vh",
    },
  },

  dropdownMenu: {
    maxHeight: "35vh",
    width: "fit-content",
    overflow: "hidden",
    "& .MuiMenuItem-root": {
      fontSize: "1.4vh",
      padding: "0.5vh 1vh",
      fontFamily: "Poppins, sans-serif",
    },
  },
};

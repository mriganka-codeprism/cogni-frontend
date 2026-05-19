import { Box, Typography, TextField, Button, Divider } from "@mui/material";
import { styles } from "../styles/EvaluationCriteria.styles";
import { useNavigate, useLocation } from "react-router-dom";
import { routes } from "../constants/routes";
import { useState, useEffect, useRef } from "react";

import { generateTraitLevels } from "../api/api";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import { getSuggestedSkills } from "../api/api";
import { keyframes } from "@mui/system";
import deleteevaluationicon from "../assets/images/deleteevaluationicon.png";

const sparkleRotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const sparklePulse = keyframes`
  0%   { filter: drop-shadow(0 0 0.2vh rgba(123,63,228,0.4)); }
  50%  { filter: drop-shadow(0 0 0.8vh rgba(123,63,228,0.9)); }
  100% { filter: drop-shadow(0 0 0.2vh rgba(123,63,228,0.4)); }
`;
const STORAGE_KEY = "evaluationCriteriaForm";
interface EvaluationCriteriaProps {
  embedded?: boolean;
  onValidationChange?: (valid: boolean) => void;
  clearTrigger?: number;
  validationTrigger?: number;
}

type CriteriaCard = {
  id: string;
  title: string;
  description: string;
  isGenerating: boolean;
  error: boolean;
  highlight: boolean;
  descriptionError: boolean;

};
const getWordCount = (text: string) => {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
};


const EvaluationCriteria = ({
  embedded,
  onValidationChange,
  clearTrigger,
  validationTrigger,

}: EvaluationCriteriaProps) => {
  const navigate = useNavigate();
  // const [boxes, setBoxes] = useState([{ text: "", isEditing: false }]);

  // const [criteriaList, setCriteriaList] = useState<CriteriaItem[]>([]);

  // const [generatedList, setGeneratedList] = useState<CriteriaItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasMounted, setHasMounted] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Record<string, string>>({});
  const [suggestedCriteria, setSuggestedCriteria] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [cachedJobDescription, setCachedJobDescription] = useState<string>("");
  const hasProcessedClear = useRef<number | null>(clearTrigger || 0);

  useEffect(() => {
    if (clearTrigger && hasProcessedClear.current !== clearTrigger) {
      hasProcessedClear.current = clearTrigger;
      setCards([
        {
          id: crypto.randomUUID(),
          title: "",
          description: "",
          isGenerating: false,
          error: false,
          highlight: false,
          descriptionError: false,
        },
      ]);
      setSelectedTags({});
      setSuggestedCriteria([]);
      sessionStorage.removeItem(STORAGE_KEY);
      if (onValidationChange) onValidationChange(false);
    }
  }, [clearTrigger, onValidationChange]);

  const [cards, setCards] = useState<CriteriaCard[]>([]);



  const handleSuggestedClick = (title: string) => {
    // already exists → scroll to card
    if (selectedTags[title]) {
      const el = document.getElementById(selectedTags[title]);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    let newCardId = "";

    setCards(prev => {
      const last = prev[prev.length - 1];

      // fill empty card
      if (last && !last.title && !last.description) {
        newCardId = last.id;
        return prev.map((c, i) =>
          i === prev.length - 1
            ? { ...c, title, highlight: true }
            : c
        );
      }

      // create new card
      const id = crypto.randomUUID();
      newCardId = id;

      return [
        ...prev,
        {
          id,
          title,
          description: "",
          isGenerating: false,
          error: false,
          highlight: true,
          descriptionError: false,
        },
      ];
    });

    // store mapping
    setSelectedTags(prev => ({
      ...prev,
      [title]: newCardId,
    }));

    // scroll to card
    setTimeout(() => {
      const el = document.getElementById(newCardId);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
  };


  const scrollToLastCard = () => {
    setTimeout(() => {
      const el = document.querySelector("[data-card]:last-child");
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };


  const location = useLocation();
  const state = (location.state as any) || {};


  // Load from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.criteriaList && parsed.generatedList) {
          const loadedCards = parsed.criteriaList.map((title: string, index: number) => ({
            id: crypto.randomUUID(),
            title,
            description: parsed.generatedList[index] || "",
            isGenerating: false,
            error: false,
            highlight: false,
            descriptionError: false,
          }));

          setCards(loadedCards);

          // Rebuild selectedTags mapping
          const tags: Record<string, string> = {};
          loadedCards.forEach((card: CriteriaCard) => {
            if (card.title.trim()) {
              tags[card.title] = card.id;
            }
          });
          setSelectedTags(tags);
          setHasMounted(true);
          return;
        }
      } catch (_) {
        // Invalid cache, continue
      }
    }
    
    // No saved data or invalid JSON - initialize with one empty card
    setCards([
      {
        id: crypto.randomUUID(),
        title: "",
        description: "",
        isGenerating: false,
        error: false,
        highlight: false,
        descriptionError: false,
      },
    ]);
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!clearTrigger) return;
    if (hasProcessedClear.current === clearTrigger) return;

    hasProcessedClear.current = clearTrigger;

    setCards([
      {
        id: crypto.randomUUID(),
        title: "",
        description: "",
        isGenerating: false,
        error: false,
        highlight: false,
        descriptionError: false,
      },
    ]);

    setError("");
    setShowErrors(false);

    sessionStorage.removeItem(STORAGE_KEY);

    onValidationChange?.(false);

  }, [clearTrigger, onValidationChange]);

  useEffect(() => {
    if (validationTrigger) {
      setShowErrors(true);
    }
  }, [validationTrigger]);

  useEffect(() => {
    if (validationTrigger === 0) {
      setShowErrors(false);
    }
  }, [validationTrigger]);

  useEffect(() => {
    if (!hasMounted) return;

    const data = {
      criteriaList: cards.map((c: CriteriaCard) => c.title),
      generatedList: cards.map((c: CriteriaCard) => c.description),
    };

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [cards, hasMounted]);



  const {
    basicDetails,
    jobDescription: jobDescFromState,
    job: jobFromDetails,
  } = state;

  // Job description: from Create Job form (sessionStorage), or from JobDetails page (location.state)
  const createJobForm =
    typeof window !== "undefined"
      ? sessionStorage.getItem("createJobPostForm")
      : null;
  const parsedCreateJob = createJobForm ? JSON.parse(createJobForm) : null;
  const jobDescription =
    jobDescFromState ??
    jobFromDetails?.description ??
    basicDetails?.jobDescription ??
    parsedCreateJob?.jobDescription ??
    "";
  // 🔑 Reset to ONE empty add box (no extra inputs)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!jobDescription?.trim()) return;

      // ✅ Check if we already have cached suggestions for this job description
      const cachedData = sessionStorage.getItem("evaluationCriteriaSuggestions");
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          // If the cached description matches current, use cached suggestions
          if (parsed.jobDescription === jobDescription && parsed.suggestions) {
            setSuggestedCriteria(parsed.suggestions);
            setCachedJobDescription(jobDescription);
            console.log("✅ Using cached suggestions");
            return;
          }
        } catch (_) {
          // Invalid cache, continue to fetch
        }
      }

      // 🔑 New job description detected, fetch suggestions
      console.log(" Fetching new suggestions for updated job description...");
      try {
        setLoadingSuggestions(true);

        const response = await getSuggestedSkills(jobDescription);

        // 🔑 adapt depending on API response shape
        const skills =
          response?.skills ||
          response?.suggested_skills ||
          response ||
          [];

        setSuggestedCriteria(skills);
        setCachedJobDescription(jobDescription);

        // ✅ Cache the suggestions for future navigation
        sessionStorage.setItem(
          "evaluationCriteriaSuggestions",
          JSON.stringify({
            jobDescription,
            suggestions: skills,
            timestamp: Date.now()
          })
        );
      } catch (err) {
        console.error("Failed to load suggested criteria", err);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [jobDescription]);









  const isFormValid = cards.every(
    c =>
      c.title.trim().length > 0 &&
      c.description.trim().length > 0 &&
      !c.isGenerating &&
      !c.descriptionError
  );



  const handleGenerateDescription = async (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card || !card.title.trim()) {
      alert("Please enter a criteria title first");
      return;
    }

    const token = sessionStorage.getItem("access_token");
    if (!token) {
      alert("Authentication error - token not found");
      return;
    }

    if (!jobDescription.trim()) {
      alert("Please enter a job description first");
      return;
    }

    console.log("🚀 Starting trait generation for:", card.title);

    setCards(prev =>
      prev.map(c =>
        c.id === cardId
          ? { ...c, isGenerating: true, error: false }
          : c
      )
    );

    try {
      console.log("📡 Calling generateTraitLevels API...");
      const result = await generateTraitLevels(
        jobDescription,
        card.title,   // ✅ send criteria title
        token
      );

      console.log("✅ Generation successful!");
      console.log("📊 Full API Response:", JSON.stringify(result, null, 2));

      // ✅ Extract only skill level values from skills array (with level labels)
      let generatedText = "";

      if (typeof result === 'string') {
        // If response is already a string, use it directly
        generatedText = result;
      } else if (result && typeof result === 'object') {
        const skillLevels: string[] = [];

        // Check if result has skills array
        if (Array.isArray(result.skills) && result.skills.length > 0) {
          // Iterate through skills and extract levels
          for (const skillObj of result.skills) {
            // Extract level1, level2, level3, etc. values from this skill
            for (const key in skillObj) {
              if (key.match(/^level\d+$/i)) {
                skillLevels.push(`${key}: ${skillObj[key]}`);
              }
            }
          }
        } else {
          // If no skills array, try to extract levels from top-level result
          for (const key in result) {
            if (key.match(/^level\d+$/i)) {
              skillLevels.push(`${key}: ${result[key]}`);
            }
          }
        }

        // If we found skill levels, display them
        if (skillLevels.length > 0) {
          generatedText = skillLevels.join('\n');
        } else {
          // Fallback: if no level* keys found, convert entire response to JSON
          generatedText = JSON.stringify(result, null, 2);
        }
      } else {
        // Fallback
        generatedText = String(result);
      }

      console.log("💾 Generated text to display:", generatedText);

      setCards(prev =>
        prev.map(c =>
          c.id === cardId
            ? {
              ...c,
              description: generatedText,
              isGenerating: false,
              error: false,
            }
            : c
        )
      );

      console.log("✅ Description updated in UI");
    } catch (err: any) {
      console.error("❌ Generation failed!");
      console.error("Error:", err);
      const errorMsg = err?.message || String(err);
      console.error("Error message:", errorMsg);

      setCards(prev =>
        prev.map(c =>
          c.id === cardId
            ? { ...c, isGenerating: false, error: true }
            : c
        )
      );

      // Better error message for timeout
      let displayMsg = errorMsg;
      if (errorMsg.includes("timed out") || errorMsg.includes("timeout")) {
        displayMsg = "Request timed out. The AI generation is taking longer than expected. Please try again.";
      }

      alert(`Failed to generate description: ${displayMsg}`);
    }
  };

  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isFormValid);
    }
  }, [isFormValid, onValidationChange]);


  useEffect(() => {
    if (validationTrigger) {
      setShowErrors(true);
    }
  }, [validationTrigger]);

  useEffect(() => {
    if (validationTrigger === 0) {
      setShowErrors(false);
    }
  }, [validationTrigger]);



  const deleteCard = (id: string) => {
    // Prevent deletion if only one card remains
    if (cards.length === 1) {
      return;
    }

    setCards(prev => prev.filter(card => card.id !== id));

    // remove tag mapping
    setSelectedTags(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(tag => {
        if (updated[tag] === id) delete updated[tag];
      });
      return updated;
    });
  };


  const addCriteriaCard = () => {
    setCards(prev => {
      const last = prev[prev.length - 1];

      if (
        last &&
        last.title.trim() === "" &&
        last.description.trim() === ""
      ) {
        return prev; // do not create duplicate empty card
      }

      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          title: "",
          description: "",
          isGenerating: false,
          error: false,
          highlight: false,
          descriptionError: false,
        },
      ];
    });


    // focus handled after render
    setTimeout(() => {
      const inputs = document.querySelectorAll<HTMLInputElement>(
        "[data-title-input]"
      );
      inputs[inputs.length - 1]?.focus();
    }, 0);
  };




  const formContent = (
    <>
      {/* HEADER */}
      {/* HEADER */}
      <Box sx={styles.headerRow}>
        {/* LEFT SIDE */}
        <Box>
          <Typography sx={styles.sectionTitle}>
            Evaluation Criteria
          </Typography>

          <Typography sx={styles.sectionSubtitle}>
            Define the key parameters on which candidates will be evaluated
          </Typography>
        </Box>

        {/* RIGHT SIDE BUTTON */}
        <Box sx={styles.addCriteriaTopBtn} onClick={addCriteriaCard}>
          + Add Criteria
        </Box>
      </Box>

      {/* DIVIDER */}
      <Divider sx={{ width: "75vw", marginBottom: "1.5vh", borderBottomWidth: "0.2vh", color: "#E6E6E6" }} />
      {/* SUGGESTED CRITERIA */}
      <Box sx={styles.suggestedRow}>

        <Box sx={styles.suggestedLeft}>
          <Typography sx={styles.suggestedLabel}>
            Suggested Criteria:
          </Typography>
          {loadingSuggestions ? (
            <Typography sx={styles.loadingText}>
              Loading suggestions...
            </Typography>
          ) : !Array.isArray(suggestedCriteria) || suggestedCriteria.length === 0 ? (
            <Typography sx={styles.loadingText}>
              No suggestions available
            </Typography>
          ) : (
            suggestedCriteria.map((item) => {
              const isSelected = selectedTags[item] || cards.some(c => c.title === item);
              return (
                <Box
                  key={item}
                  sx={{
                    ...styles.suggestedTag,
                    opacity: isSelected ? 0.5 : 1,
                    cursor: isSelected ? "default" : "pointer",
                    pointerEvents: isSelected ? "none" : "auto",
                  }}
                  onClick={() => handleSuggestedClick(item)}
                >
                  {item}
                </Box>
              );
            })
          )}

        </Box>

      </Box>


      {/* CARDS CONTAINER */}
      <Box
        sx={{
          ...styles.criteriaContainer,
          opacity: loadingSuggestions ? 0.5 : 1,
          pointerEvents: loadingSuggestions ? "none" : "auto",
          transition: "opacity 0.3s ease",
        }}
      >
        <Box sx={styles.criteriaOuterContainer}>
          <Box sx={styles.cardsContainer}>
            {cards.map((card) => (
              <Box
                data-card
                key={card.id}
                id={card.id}
                sx={{
                  ...styles.card,
                  ...(card.highlight && styles.cardHighlight),
                  ...(card.descriptionError && styles.cardError),
                }}
              >
                <Box
                  sx={{
                    ...styles.deleteIcon,
                    ...(cards.length === 1 && { opacity: 0.5, cursor: "not-allowed", pointerEvents: "none" }),
                  }}
                  onClick={() => deleteCard(card.id)}
                >
                  <img src={deleteevaluationicon} alt="" style={{ height: "2vh", width: "2vh", marginRight: "0.2vh" }} />
                </Box>
                {/* TITLE */}
                <Typography sx={styles.label}>
                  Criteria Title <span style={styles.requiredStar}>*</span>
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter criteria title"
                  value={card.title}
                  sx={{
                    ...styles.titleInput,
                    ...styles.errorField,
                    fontFamily: "Poppins, sans-serif",
                  }}
                  inputProps={{ "data-title-input": true }}
                  error={showErrors && card.title.trim() === ""}
                  helperText={showErrors && card.title.trim() === "" ? "Please enter this field" : ""}
                  FormHelperTextProps={{
                    sx: {
                      fontSize: "1.2vh",
                      fontFamily: "Poppins, sans-serif",
                      marginTop: "0.4vh",
                      marginLeft: "0vh",
                      color: "#900B09",
                    },
                  }}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCards(prev =>
                      prev.map(c =>
                        c.id === card.id
                          ? { ...c, title: e.target.value }
                          : c
                      )
                    )
                  }

                />

                {/* DESCRIPTION HEADER */}
                <Box sx={styles.descHeader}>
                  <Typography sx={styles.label}>
                    Criteria Description <span style={styles.requiredStar}>*</span>
                  </Typography>

                  <Box
                    sx={styles.generateBtn}
                    onClick={() => handleGenerateDescription(card.id)}
                  >
                    <AutoAwesomeOutlinedIcon
                      className="generateIcon"
                      sx={{
                        ...styles.generateIcon,
                        animation: card.isGenerating
                          ? `${sparkleRotate} 1.8s linear infinite, ${sparklePulse} 1.6s ease-in-out infinite`
                          : "none",
                      }}
                    />

                    <Typography sx={styles.generateText}>
                      {card.isGenerating ? "Generating..." : "Generate"}
                    </Typography>
                  </Box>
                </Box>

                {/* DESCRIPTION */}
                <TextField
                  fullWidth
                  multiline
                  minRows={8}
                  placeholder="Enter description"
                  value={card.description}
                  sx={{
                    ...styles.descriptionInput,
                    ...styles.errorField,
                  }}
                  disabled={card.isGenerating}
                  error={showErrors && card.description.trim() === ""}
                  helperText={showErrors && card.description.trim() === "" ? "Please enter this field" : ""}
                  FormHelperTextProps={{
                    sx: {
                      fontSize: "1.2vh",
                      marginTop: "0.4vh",
                      marginLeft: "0vh",
                      color: "#900B09",
                    },
                  }}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    const value = e.target.value;
                    const wordCount = getWordCount(value);

                    if (wordCount > 500) {
                      setCards(prev =>
                        prev.map(c =>
                          c.id === card.id
                            ? { ...c, description: value, descriptionError: true }
                            : c
                        )
                      );
                      return;
                    }

                    setCards(prev =>
                      prev.map(c =>
                        c.id === card.id
                          ? { ...c, description: value, descriptionError: false }
                          : c
                      )
                    );
                  }}
                />

                {/* COUNTER */}
                {/* ERROR + WORD COUNT ROW */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    marginTop: "0.4vh",
                  }}
                >
                  {/* LEFT CORNER → ERROR */}
                  <Typography
                    sx={{
                      fontSize: "1.2vh",
                      color: "#900B09",
                      visibility:
                        getWordCount(card.description) > 500 ? "visible" : "hidden",
                    }}
                  >
                    Word limit exceeded
                  </Typography>

                  {/* RIGHT CORNER → COUNT */}
                  <Typography
                    sx={{
                      fontSize: "1.2vh",
                      color:
                        getWordCount(card.description) > 500
                          ? "#900B09"
                          : "#888",
                      textAlign: "right",
                    }}
                  >
                    {getWordCount(card.description)} / 500 words
                  </Typography>
                </Box>

              </Box>
            ))}

          </Box>
        </Box>
      </Box>
    </>
  );

  if (embedded) {
    return <Box sx={styles.root}>{formContent}</Box>;
  }

  return <Box sx={styles.root}>{formContent}</Box>;
};

export default EvaluationCriteria;
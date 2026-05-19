import { Box, Divider, Typography, ToggleButton } from "@mui/material";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useState, useMemo } from "react";
import Text  from "../components/textComponent";


const EMOTION_COLORS: { [key: string]: string[] } = {
  Neutral: [
    "#ffe066",
    "#ffd23f",
    "#ffb627",
    "#ff924c",
    "#ff5e5b",
    "#ff3c38",
    "#ff1e56",
    "#ff0844",
    "#e60026",
    "#b8001c",
  ],
  default: Array(10).fill("#ffe066"), // yellow for others
};

const EMOTION_ORDER = [
  "Angry",
  "Fear",
  "Surprise",
  "Happy",
  "Neutral",
  "Sad",
] as const;

type EmotionType = (typeof EMOTION_ORDER)[number];

const EMOTION_COLORS_MAP: Record<EmotionType, string> = {
  Angry: "#FF0000",
  Fear: "#2E003E",
  Surprise: "#FFA500",
  Happy: "#FFD700",
  Neutral: "#B0B0B0",
  Sad: "#1E90FF",
};

const EmotionCard = ({
  name,
  width,
  gender,
  emotions,
  elevation,
  formattedFramesData,
}: {
  name: string;
  width: string;
  gender: string;
  emotions: { [emotion: string]: number }; // scale from 0–100
  elevation?: number;
  formattedFramesData: any[];
}) => {
  const [showGraph, setShowGraph] = useState(false);

  // Get video duration from the last frame's time
  const videoDuration = useMemo(() => {
    if (formattedFramesData.length === 0) return 0;
    return Math.ceil(formattedFramesData[formattedFramesData.length - 1].videoTime);
  }, [formattedFramesData]);

  // Sort frames by videoTime when formattedFramesData changes
  // const sortedFrames = useMemo(() => {
  //   return [...formattedFramesData].sort((a, b) => a.videoTime - b.videoTime);
  // }, [formattedFramesData]);

  const getBoxes = (emotion: string, value: number) => {
    const total = 10;
    // Ensure value is a valid number
    const safeValue = isNaN(value) ? 0 : value;
    const filled = (safeValue / 100) * total; // Remove Math.round to keep decimal precision
    const colors =
      emotion === "Neutral" ? EMOTION_COLORS.Neutral : EMOTION_COLORS.default;
    return [...Array(total)].map((_, i) => {
      const boxFill = Math.max(0, Math.min(1, filled - i)); // Calculate fill percentage for this box
      const isPartiallyFilled = boxFill > 0 && boxFill < 1;

      return (
        <Box
          key={i}
          sx={{
            width: '3vh',
            height: '1.5vh',
            // mx: 0.2,
            backgroundColor: i < Math.floor(filled) ? colors[i] : "#787878",
            backgroundImage: isPartiallyFilled
              ? `linear-gradient(to right, ${colors[i]} ${
                  boxFill * 100
                }%, #787878 ${boxFill * 100}%)`
              : "none",
            transition: "background 0.3s",
          }}
        />
      );
    });
  };

  // Create data for the line chart - show all frames from 0 to video end time
  const chartData = useMemo(() => {
    return formattedFramesData.map((frame) => ({
      time: frame.videoTime,
      ...EMOTION_ORDER.reduce(
        (acc, emotion) => {
          // Parse the emotion value and handle NaN values
          const emotionValue = frame.emotions ? 
            Number((frame.emotions[emotion.toLowerCase()] * 100).toFixed(1)) || 0 : 0;
          return {
            ...acc,
            [emotion]: emotionValue,
          };
        },
        {}
      ),
    }));
  }, [formattedFramesData]);

  return (
    <Box
      sx={{
        backgroundColor: "#5a5a5a",
        p: '2vh',
        borderRadius: '3vh',
        boxShadow: elevation || 3,
        width: width || undefined,
        fontSize: "1.5vh",
        color: "white",
        fontFamily: "Arial Rounded MT Bold, Arial, sans-serif",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
       variant="heading"
        styles={{ fontSize: "2.1vh", color: "white" ,textTransform:'capitalize'}}
        >
          {name.toLowerCase()}
        </Text>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {gender === "Male" ? (
            <MaleIcon sx={{ color: "#2196f3", fontSize: "3.1vh" }} />
          ) : (
            <FemaleIcon sx={{ color: "#2196f3", fontSize: "3.1vh" }} />
          )}
          <Typography
            fontWeight="bold"
            sx={{ fontSize: "2.1vh", color: "white" }}
          >
            {gender}
          </Typography>
          <ToggleButton
            value="graph"
            selected={showGraph}
            onChange={() => setShowGraph(!showGraph)}
            sx={{
              ml: '1vh',
              p: '0.5vh',
              border: "none",
              "&.Mui-selected": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                },
              },
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.05)",
              },
            }}
          >
            <ShowChartIcon sx={{ color: "#2196f3", fontSize: "3.1vh" }} />
          </ToggleButton>
        </Box>
      </Box>
      <Divider sx={{ my: '0.5vh', background: "#bdbdbd",borderWidth:'0.1vh' }} />

      {showGraph ? (
          <Box sx={{ 
            width: "100%",
            height: "25vh",
            mt: '2vh',
          }}>
            <ResponsiveContainer width={"100%"} height={"100%"}>
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#666" />
                <XAxis
                  dataKey="time"
                  stroke="#fff"
                  tickFormatter={(value) => `${Math.floor(value)}s`}
                  domain={[0, videoDuration]}
                  ticks={Array.from({ length: videoDuration + 1 }, (_, i) => i)}
                />
                <YAxis stroke="#fff" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#5a5a5a",
                    border: "none",
                    borderRadius: "0.5vh",
                    color: "#fff",
                    fontSize:'2vh'
                  }}
                  labelFormatter={(value) => `Time: ${Math.floor(value)}s`}
                />
                <Legend />
                {EMOTION_ORDER.map((emotion) => (
                  <Line
                    key={emotion}
                    type="monotone"
                    dataKey={emotion}
                    name={emotion}
                    stroke={EMOTION_COLORS_MAP[emotion]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 4
                    }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Box>
      ) : (
        // Emotions
        <Box sx={{ 
          height: "25vh",
          mt: '2vh',
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}>
          {EMOTION_ORDER.map((emotion) => (
            <Box
              key={emotion}
              sx={{
                display: "flex",
                alignItems: "center",
                my: '0.3vh',
                width: "100%",
              }}
            >
              {/* Label */}
              <Box sx={{ 
                width: "8vh",
                flexShrink: 0
              }}>
                <Typography
                  sx={{ color: "white", fontWeight: "bold", fontSize: "1.8vh" }}
                >
                  {emotion}
                </Typography>
              </Box>
              {/* Bar */}
              <Box sx={{ 
                display: "flex", 
                gap: '0.3vh', 
                flexGrow: 1,
                // mx: '2vh',
                justifyContent: "flex-start"
              }}>
                {getBoxes(emotion, emotions[emotion] || 0)}
              </Box>
              {/* Value */}
              <Box sx={{ 
                // width: '10vh', 
                textAlign: "right",
                flexShrink: 0,
                // minWidth: '10vh'
              }}>
                <Typography
                  sx={{ 
                    color: "white", 
                    fontWeight: "bold", 
                    fontSize: "1.8vh",
                    whiteSpace: "nowrap"
                  }}
                >
                  {emotions[emotion] !== undefined && !isNaN(emotions[emotion]) 
                    ? emotions[emotion].toFixed(1) 
                    : '0.0'}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default EmotionCard;

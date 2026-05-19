import {
  Box,
  Typography,
  Select,
  MenuItem,
  Button,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import CachedIcon from "@mui/icons-material/Cached";
import { categoryStyles } from "../styles/categoryManagement.styles";

const kpis = [
  {
    key: "totalCandidates",
    label: "Total Candidates",
    value: "1761",
    icon: (
      <PeopleAltOutlinedIcon
        sx={{ fontSize: "2.2vh", color: "text.secondary" }}
      />
    ),
    trend: "+12% vs last week",
  },
  {
    key: "totalColleges",
    label: "Total Colleges",
    value: "25",
    icon: (
      <SchoolOutlinedIcon sx={{ fontSize: "2.2vh", color: "text.secondary" }} />
    ),
    trend: "+4% vs last week",
  },
  {
    key: "interviewCompletion",
    label: "Interview Completion",
    value: "79%",
    icon: (
      <TaskAltOutlinedIcon
        sx={{ fontSize: "2.2vh", color: "text.secondary" }}
      />
    ),
    trend: "+3% vs last week",
  },
  {
    key: "interviewSelection",
    label: "Interview Selection",
    value: "82%",
    icon: (
      <HowToRegOutlinedIcon
        sx={{ fontSize: "2.2vh", color: "text.secondary" }}
      />
    ),
    trend: "+3% vs last week",
  },
  {
    key: "avgAiScore",
    label: "Avg AI Score",
    value: "75%",
    icon: (
      <InsightsOutlinedIcon
        sx={{ fontSize: "2.2vh", color: "text.secondary" }}
      />
    ),
    trend: "+2% vs last week",
  },
  {
    key: "topPersonaType",
    label: "Top Persona Type",
    value: "Technical",
    icon: (
      <InsightsOutlinedIcon
        sx={{ fontSize: "2.2vh", color: "text.secondary" }}
      />
    ),
  },
];

const evaluateDashboard = () => {
  return (
    <>
      {/* Dropdowns and Buttons */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "2vh",
          justifyContent: "space-between",
          px: "2vh",
          py: "1vh",
        }}
      >
        <Box sx={{ display: "flex", gap: "3vh", marginBottom: "2.7vh" }}>
          <Box>
            <Typography
              variant="body2"
              sx={{
                fontSize: "1.4vh",
                fontWeight: 600,
                mb: "0.7vh",
                color: "text.primary",
              }}
            >
              College
            </Typography>
            <Select
              //   value={college}
              //   onChange={(e) => {
              //     setCollege(e.target.value);
              //   }}
              displayEmpty
              size="small"
              sx={{
                ...categoryStyles.textfield,
                fontSize: "1.3vh",
                minWidth: "15vh",
                borderRadius: "1vh",
                // marginLeft:'15vh',
                width: "20vh",
                // "& .MuiSelect-select": {
                //   fontSize: "1.3vh",
                //   padding: "1vh",
                // },
                "& .MuiSelect-icon": {
                  fontSize: "2.5vh",
                },
              }}
            >
              <MenuItem value="" sx={{ fontSize: "1.3vh" }}>
                All Colleges
              </MenuItem>
              {/* {collegeList.map((col) => (
            <MenuItem
              key={col.id}
              value={col.id}
              sx={{ fontSize: "1.3vh" }}
            >
              {col.name}
            </MenuItem>
          ))} */}
            </Select>
          </Box>
          <Box>
            <Typography
              variant="body2"
              sx={{
                fontSize: "1.4vh",
                fontWeight: 600,
                mb: "0.7vh",
                color: "text.primary",
              }}
            >
              Stream
            </Typography>
            <Select
              //   value={selectedCandidateStatus}
              //   onChange={(e) => setSelectedCandidateStatus(e.target.value)}
              displayEmpty
              size="small"
              sx={{
                ...categoryStyles.textfield,
                borderRadius: "1vh",
                // marginLeft:'15vh',
                fontSize: "1.3vh",
                minWidth: "15vh",
                width: "20vh",
                // "& .MuiSelect-select": {
                //   fontSize: "1.3vh",
                //   padding: "1vh",
                // },
                "& .MuiSelect-icon": {
                  fontSize: "2.5vh",
                },
              }}
            >
              <MenuItem value="" sx={{ fontSize: "1.3vh" }}>
                All Status
              </MenuItem>
              <MenuItem value="Selected" sx={{ fontSize: "1.3vh" }}>
                Selected
              </MenuItem>
              <MenuItem value="Not selected" sx={{ fontSize: "1.3vh" }}>
                Not Selected
              </MenuItem>
              <MenuItem value="Not evaluated" sx={{ fontSize: "1.3vh" }}>
                Not Evaluated
              </MenuItem>
              <MenuItem value="Disqualified" sx={{ fontSize: "1.3vh" }}>
                Disqualified
              </MenuItem>
            </Select>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "1vh" }}>
          <Button
            variant="outlined"
            startIcon={<CachedIcon />}
            sx={{
              borderRadius: "1vh",
              borderColor: "#a00",
              borderWidth: "0.15vh",
              color: "#a00",
              minWidth: "10vh",
              fontWeight: 600,
              fontSize: "1.5vh",
              padding: "0.8vh 1.5vh",
              "& .MuiButton-startIcon>*:nth-of-type(1)": {
                fontSize: "2.5vh",
              },
              "& .MuiButton-startIcon": {
                marginLeft: "0vh",
                marginRight: "0.7vh",
              },
            }}
            // onClick={handleDownloadCsv}
            // disabled={!college || downloading}
          >
            {/* {downloading ? 'Downloading...' : 'Download'} */}
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          mb: "2vh",
          display: "grid",
          gap: 2,
          gridTemplateColumns: "repeat(6, 1fr)",
          px: "2vh",
        }}
      >
        {kpis.map((kpi) => (
          <Card
            key={kpi.key}
            sx={{
              borderRadius: "1.5vh",
              boxShadow: "0px 8px 25px 0px #0000001A",
              height: "100%",
            }}
          >
            <CardContent
              sx={{
                p: "2vh",
                "&.MuiCardContent-root:last-child": { pb: "2vh" },
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: "1vh" }}
              >
                {kpi.icon}
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ fontSize: "1.5vh", fontWeight: 600 }}
                >
                  {kpi.label}
                </Typography>
              </Stack>
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, fontSize: "3.2vh" }}
              >
                {kpi.value}
              </Typography>
              {kpi.trend && (
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0.5}
                  sx={{ mt: "0.6vh" }}
                >
                  <TrendingUpIcon
                    sx={{ fontSize: "2vh", color: "success.main" }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: "success.main", fontSize: "1.3vh" }}
                  >
                    {kpi.trend}
                  </Typography>
                </Stack>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    </>
  );
};

export default evaluateDashboard;

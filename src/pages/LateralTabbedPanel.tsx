import React, { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import { useLocation, useNavigate } from "react-router-dom";
import LateralHome from "./lateralhome";
import LateralAnalysis from "./lateralanalysis";
import { routes } from "../constants/routes";
import adminhome from "../assets/images/adminhome.png";
import candidateevaluation from "../assets/images/candidateevaluation.png";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`lateral-tabpanel-${index}`}
      aria-labelledby={`lateral-tabpanel-${index}`}
      {...other}
      style={{
        width: "100%",
        display: value === index ? "block" : "none",
      }}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const LateralTabbedPanel: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tabValue, setTabValue] = useState(0);
  const [toggle, setToggle] = useState("Lateral");

  // Synchronize tab value with location if needed (currently we only have one main route for this panel)
  // But we can use query params or internal state
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const tabsStyles = {
    borderBottom: "0.15vh solid #E5E7EB",
    minHeight: "7.2vh",
    "& .MuiTabs-scroller": {
      marginBottom: "0vh",
    },
    "& .MuiTab-root": {
      minHeight: "7.2vh",
      color: "#000000",
      fontSize: "1.5vh",
      width: "auto",
      minWidth: "auto",
      paddingX: "2vh",
      paddingY: "1.5vh",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: "0.8vh",
      fontWeight: 500,
      fontFamily: "Poppins, sans-serif",
      textTransform: "none",
      transition: "all 0.3s ease",
      "& img": {
        transition: "opacity 0.3s ease",
        opacity: 1,
      },
      "&.Mui-selected": {
        color: "#000000",
      },
    },
    "& .MuiTabs-indicator": {
      backgroundColor: "#00695c",
      height: "0.3vh",
    },
    "& .MuiTabs-flexContainer": {
      paddingLeft: "2.5vh",
    },
  };

  const toggleContainerStyles = {
    display: "flex",
    backgroundColor: "#006b66",
    borderRadius: "3vh",
    padding: "0.4vh",
    gap: "0.4vh",
    height: "4.5vh",
    alignItems: "center",
    marginRight: "2vh",
  };

  const toggleItemStyles = (isActive: boolean) => ({
    fontFamily: "Poppins, sans-serif",
    display: "flex",
    alignItems: "center",
    gap: "1vh",
    padding: "0 1.5vh",
    height: "3.7vh",
    borderRadius: "2.5vh",
    cursor: "pointer",
    fontSize: "1.4vh",
    fontWeight: 700,
    transition: "all 0.3s ease",
    backgroundColor: isActive ? "#fff" : "transparent",
    color: isActive ? "#006b66" : "#fff",
  });

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ ...tabsStyles, minHeight: "8vh", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="lateral panel tabs"
          TabIndicatorProps={{
            children: <span className="custom-indicator" />,
          }}
          sx={{
            minHeight: "7.2vh",
            "& .MuiTabs-indicator": {
              display: "flex",
              justifyContent: "flex-start",
              backgroundColor: "transparent",
            },
            "& .custom-indicator": {
              width: "15vh",
              height: "0.3vh",
              backgroundColor: "#00695c",
              marginLeft: "2vh",
              borderRadius: "1vh",
            },
          }}
        >
          <Tab
            label="Home"
            icon={<img src={adminhome} alt="Home" style={{ height: "2vh", width: "2vh", marginRight: "0.8vh" }} />}
            iconPosition="start"
            sx={{
              minHeight: "7.2vh",
              maxWidth: "36vh",
            }}
          />
          <Tab
            label="Candidate Analysis"
            icon={<img src={candidateevaluation} alt="Candidate Evaluation" style={{ height: "2vh", width: "2vh", marginRight: "0.8vh" }} />}
            iconPosition="start"
            sx={{
              minHeight: "7.2vh",
              maxWidth: "36vh",
            }}
          />
        </Tabs>

        {/* Fresher/Lateral Toggle */}
        <Box sx={toggleContainerStyles}>
          <Box
            onClick={() => {
              setToggle("Fresher");
              navigate(routes.adminHome);
            }}
            sx={toggleItemStyles(toggle === "Fresher")}
          >
            <PersonIcon sx={{ fontSize: "1.8vh", width: "2vh", height: "2vh", marginRight: "0.5vh" }} />
            Fresher
          </Box>
          <Box
            onClick={() => {
              setToggle("Lateral");
              navigate(routes.lateralAdmin);
            }}
            sx={toggleItemStyles(toggle === "Lateral")}
          >
            <BusinessCenterIcon sx={{ fontSize: "1.8vh", width: "2vh", height: "2vh", marginRight: "0.5vh" }} />
            Lateral
          </Box>
        </Box>
      </Box>

      <CustomTabPanel value={tabValue} index={0}>
        <LateralHome />
      </CustomTabPanel>

      <CustomTabPanel value={tabValue} index={1}>
        <LateralAnalysis />
      </CustomTabPanel>
    </Box>
  );
};

export default LateralTabbedPanel;

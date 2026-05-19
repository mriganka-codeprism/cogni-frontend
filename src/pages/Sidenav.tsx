import { FC, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

interface SidebarItem {
  label: string;
  path: string;
  icon: JSX.Element;
}

const sidebarItems: SidebarItem[] = [
  {
    label: "Home",
    path: "/home",
    icon: <HomeOutlinedIcon />,
  },
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <DashboardOutlinedIcon  sx={{width:"2.7vh"}}/>,
  },
];

const Sidebar: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/") {
      navigate("/home", { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <Box
  sx={{
    width: {
      xs: "18vw",
      sm: "16vw",
      md: "14vw",
      lg: "13vw",
    },

    minWidth: "12vw",
    maxWidth: "18vw",

    height: "83.5vh",
    background: "#f8f8f8",

    paddingTop: {
      xs: "1vh",
      sm: "1.2vh",
      md: "1.6vh",
    },

    transition: "all 0.2s ease",
  }}
>

      <List disablePadding>
        {sidebarItems.map((item) => {
          const isActive = item.label.toLowerCase() === "home" ?true:false;
            

          return (
            <ListItemButton
              key={item.path}
              onClick={() => navigate(item.path)}
              sx={{
                mx: "8px",
                mb: "6px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",

                backgroundColor: isActive ? "#fde9e5" : "transparent",
                color: isActive ? "#B91C1C" : "#555",

                "&:hover": {
                  backgroundColor: "#FEE2E2",
                  color: "#B91C1C",

                  "& .MuiListItemIcon-root": {
                    color: "#B91C1C",
                  },

                  "& .arrow-icon": {
                    opacity: 1,
                    transform: "translateX(0)",
                  },
                },
              }}
            >
              {/* LEFT SIDE (ICON + TEXT) */}
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <ListItemIcon
                  sx={{
                   // minWidth: "36px",
                    color: isActive ? "#B91C1C" : "#777",
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "14px",
                    fontWeight: isActive ? 600 : 500,
                  }}
                />
              </Box>

              {/* RIGHT ARROW */}
              <ChevronRightIcon
                className="arrow-icon"
                sx={{
                  fontSize: "20px",
                  opacity: isActive ? 1 : 0,
                  transform: isActive
                    ? "translateX(0)"
                    : "translateX(-6px)",
                  transition: "all 0.2s ease",
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
};

export default Sidebar;

import { Box } from "@mui/material";
import { styles } from "./dashboardLayout.styles";
//import Footer from "../footer/footer";
import Header from "../header/Header";
export interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <Box sx={{ display: "flex", height: "98vh",width:"100vw" }}>
      {/* Main Layout Area */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
        data-testid="app-screen"
      >
        <Header />
        <Box sx={{
          display: "flex",
          flex: 1,
          overflow: "hidden"
        }}>
          <Box sx={{ flex: 1, height: "100%", width: "100%", overflow: "hidden" }}>{children}</Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;

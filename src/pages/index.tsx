import DashboardLayout from "../components/dasboardLayout/dashboardLayout";
import AppScreenRouter from "../router/AppScreenRouter";
import { useLocation } from "react-router-dom";

function App() {
  const location = useLocation();
  const isPublicScreen = (): boolean => {
    return (
      location.pathname === "/login" ||
      location.pathname === "/" ||
      location.pathname.startsWith("/call")
    );
  };

  return isPublicScreen() ? (
    <AppScreenRouter />
  ) : (
    <DashboardLayout>
      <AppScreenRouter />
    </DashboardLayout>
  );
}

export default App;
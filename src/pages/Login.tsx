import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  TextField,
  Button,
  Paper,
  Box,
  Snackbar,
  Alert,
  IconButton,
  InputAdornment,
  Typography,
} from "@mui/material";
import { Grid } from "@mui/material";
import { logoConfig } from "../constants/screensData";
import { loginstyle } from "../styles/loginScreen.styles";
import { VisibilityOffOutlined, VisibilityOutlined } from "@mui/icons-material";
import Text from "../components/textComponent";
import { routes } from "../constants/routes";
import { loginUser, sendOtp, verifyOtp as verifyOtpApi } from "../api/api";
import { useMsal } from "@azure/msal-react";
import { footerstyles } from "../components/footer/footer.styles";
import { useCandidateStore } from "../store/candidateStore";

interface Notification {
  type: "success" | "error" | "info" | "warning";
  message: string;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender: string;
  password: string;
  userType: "admin" | null;
}

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [open, setOpen] = useState(false);
  const [loginMessage, setLoginMessage] = useState<Notification>({
    type: "success",
    message: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isAutofilled] = useState(false);
  const [isPageLoad, setIsPageLoad] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { instance } = useMsal();
  const setTokenPayload = useCandidateStore((state) => state.setTokenPayload);
  const fromLocation = location?.state?.from;
  const redirectTarget = fromLocation?.pathname
    ? `${fromLocation.pathname}${fromLocation.search || ""}${
        fromLocation.hash || ""
      }`
    : routes.adminHome;

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    // When the component mounts, it sets the form to "on" initially
    setIsPageLoad(true);

    const timer = setTimeout(() => {
      setIsPageLoad(false); // After the initial render, turn autoComplete off
    }, 0); // Immediate switch off after load

    return () => clearTimeout(timer);
  }, []);

  const handleSnackbarClose = () => {
    setLoginMessage({
      type: "success",
      message: "",
    });
    setOpen(false);
  };
  const notify = (data: Notification) => {
    setLoginMessage(data);
    setOpen(true);
  };

  const handleOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      notify({
        type: "error",
        message: "Please enter your email to receive OTP",
      });
      return;
    }

    // Bypass OTP for specific admin credentials
    if (email === "kaushaladmin@example.com") {
      await handleSignIn();
      return;
    }

    try {
      await sendOtp(email);
      setIsOtpSent(true);
      setOtp("");
      notify({
        type: "success",
        message: "OTP has been sent to your email",
      });
    } catch (err: any) {
      notify({
        type: "error",
        message: typeof err === "string" ? err : "Failed to send OTP",
      });
    }
  };

  const handleSSOLogin = async () => {
    instance
      .loginPopup({ scopes: ["User.Read"] })
      .then((res: any) => {
        console.log("SSO Login", res);
        sessionStorage.setItem("access_token", res?.accessToken);
        sessionStorage.setItem(
          "user",
          JSON.stringify({
            id: res?.uniqueId,
            name: res?.account?.name,
            email: res?.account?.username,
            phone: "",
            gender: "",
            password: "",
            userType: "admin",
          })
        );
        navigate(redirectTarget, { replace: true });
      })
      .catch(() => {
        console.log("error");
      });
  };

  const handleSignIn = async (e?: React.FormEvent) => {
    e?.preventDefault();

    try {
      const data = await loginUser(email, password);
      const {
        accessToken,
        refreshToken: refreshTokenValue,
        user,
      } = data as { accessToken: string; refreshToken?: string; user: UserData };

      setTokenPayload(accessToken);

      if (user.userType === "admin") {
        sessionStorage.setItem("access_token", accessToken);
        if (refreshTokenValue) {
          sessionStorage.setItem("refresh_token", refreshTokenValue);
        } else {
          sessionStorage.removeItem("refresh_token");
        }
        navigate(redirectTarget, { replace: true, state: { from: undefined } });
      } else {
        sessionStorage.clear();
        sessionStorage.clear();
        navigate(routes.candidateHome);
      }
    } catch (err: any) {
      notify({
        type: "error",
        message: typeof err === "string" ? err : "Invalid email or password",
      });
    }
  };

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      notify({
        type: "error",
        message: "Please enter the 6 digit OTP",
      });
      return;
    }

    try {
      await verifyOtpApi(email, otp);
      notify({
        type: "success",
        message: "OTP verified successfully",
      });
      await handleSignIn();
    } catch (err: any) {
      notify({
        type: "error",
        message: typeof err === "string" ? err : "Invalid OTP",
      });
    }
  };

  return (
    <Grid container sx={loginstyle.loginContainer}>
      <Grid
        // item
        size={7}
        sx={{
          ...loginstyle.gridItemBackground,
          backgroundImage: `url(${logoConfig.loginScreen})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "100vh",
        }}
      />

      <Grid
        // item
        component={Paper}
        elevation={4.5}
        square
        sx={loginstyle.gridItem}
      >
        <div
          style={{
            // paddingLeft: "5vw",
            marginTop: "9vh",
            display: "flex",
            flexDirection: "column",
            height: "60%",
          }}
        >
          <Box>
            <img
              src={logoConfig.muSigmaLogo}
              alt="MuSigma Logo"
              style={loginstyle.logoStyle}
            />
          </Box>

          <Box sx={loginstyle.fieldBox}>
            <Text
              text={"Sign in with email"}
              variant="heading"
              gutterBottom
              styles={loginstyle.heading}
            />
          </Box>

          <form onSubmit={isOtpSent ? verifyOTP : handleOTP}>
            <>
              <TextField
                label="Email"
                autoComplete={isPageLoad ? "on" : "new-email"}
                disabled={isOtpSent}
                type="text"
                variant="outlined"
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{
                  ...loginstyle.textfield,
                  backgroundColor: isAutofilled ? "transparent" : "white",
                }}
              />

              <TextField
                label={isOtpSent ? "Enter 6 digit OTP" : "Password"}
                autoComplete={isPageLoad ? "on" : "new-password"}
                type={isOtpSent ? "text" : showPassword ? "text" : "password"}
                variant="outlined"
                margin="normal"
                value={isOtpSent ? otp : password}
                onChange={(e) =>
                  isOtpSent
                    ? setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    : setPassword(e.target.value)
                }
                required
                sx={{
                  ...loginstyle.textfield,
                  backgroundColor: isAutofilled ? "transparent" : "white",
                  "& input": {
                    WebkitTextSecurity: isOtpSent ? "none" : "none",
                    MozAppearance: "textfield",
                    WebkitAppearance: "none",
                    "&::-ms-reveal, &::-ms-clear": {
                      // Remove icons in MS Edge
                      display: "none",
                    },
                  },
                }}
                InputProps={
                  isOtpSent
                    ? {
                        inputProps: {
                          maxLength: 6,
                          inputMode: "numeric",
                          pattern: "[0-9]*",
                        },
                      }
                    : {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={handleClickShowPassword} // Toggle password visibility
                              onMouseDown={(event: any) =>
                                event.preventDefault()
                              } // Prevent focus loss
                              edge="end"
                              sx={{
                                padding: "0vh",
                                fontSize: "2vh",
                                marginRight: "-1.5vh",
                              }}
                            >
                              {showPassword ? (
                                <VisibilityOffOutlined
                                  sx={loginstyle.visibilityicon}
                                />
                              ) : (
                                <VisibilityOutlined
                                  sx={loginstyle.visibilityicon}
                                />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }
                }
              />
            </>

            <Button
              type="submit"
              variant="contained"
              sx={loginstyle.submitButton}
            >
              {isOtpSent ? "Verify" : "Sign In"}
            </Button>
            {/* <Button
              variant="contained"
              sx={{...loginstyle.submitButton, mt: "4vh"}}
              onClick={handleSSOLogin}
            >
              SSO Login
            </Button> */}
          </form>
          {/* <Link
          underline="none"
            onClick={() => navigate(routes.candidateHome)}
            sx={{
              marginTop: '20vh', cursor: 'pointer', color: globalStyles.colors.primary,
              // marginLeft: '25vw',
              justifyContent: 'end',
              alignItems: 'center',
              display: 'flex', underline: 'none',
              padding: '0vh 9vh',
            }}
          >
            <ArrowOutwardOutlined sx={{ mr: "0.5vh", fontSize: "3vh" }} />
            <Text
              text={"Go to Demo"}
              variant="body"
              styles={loginstyle.guestText}
            />
          </Link> */}

          <Box sx={loginstyle.logoBox}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Text
                text={"Powered By"}
                variant="heading"
                styles={loginstyle.poweredtext}
              />
              <img
                src={logoConfig.muSigmaLogo}
                style={loginstyle.logo}
                alt="logo"
              />
              <img
                src={logoConfig.muSigmaLabsLogo}
                alt="Logo"
                style={{
                  width: "12vh",
                  //  height: "5vh",
                  marginLeft: "0vw",
                  // marginTop: "-2vh",
                }}
              />
            </Box>
          </Box>
        </div>
        <Typography sx={footerstyles.version}>V26.03.18</Typography>
      </Grid>

      {open && (
        <Snackbar
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          open={open}
          autoHideDuration={loginMessage.type === "error" ? 3000 : 2000}
          onClose={handleSnackbarClose}
          sx={{ padding: "1vh" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            color={loginMessage.type}
            severity={loginMessage.type}
            sx={{ fontSize: "2vh", padding: "1vh" }}
          >
            {loginMessage.message}
          </Alert>
        </Snackbar>
      )}
    </Grid>
  );
};

export default Login;

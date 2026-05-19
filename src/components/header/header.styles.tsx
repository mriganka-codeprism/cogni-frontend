import { styled } from "@mui/material";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";



const drawerWidth = 200;

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

export const styles = {
  appbar: {
      display: 'flex',
         width:'100%',
    height: "7vh",
        alignItems: "center",
    textAlign: "center",
    },
    text: {
      
        fontSize: '5vh',
      fontWeight: 'bold',
        // textAlign: 'center',
        
    },
    divider: {
        border: '0.1vh solid #7d91aa',
        width: '100%',
        margin: '0vh',
      
  },
    logo: {
    width: "5.5vw",
    // height: "10vh",
    marginTop:"2vh"
  },
  box: {
    justifyContent: "center",
    width:'100%'
  },
  iconButton: {
    padding: '0.6vh',
    backgroundColor: "#354657",
    borderRadius: "1vh",
    margin: '1vh',
    textAlign: "center",
    marginTop:'1vh',
    "&:hover": {
      backgroundColor: "#5a738c",
    },
  },
  icon: {
    color: "white",
    fontSize: "2vh",
  },
  text1: {
    fontSize: '2.1vh',
    color: '#131313',
    textWrap: 'nowrap',
  }
}

export const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  backgroundColor: "white",
    height: "6vw",
  boxShadow: "none",
  overflow: "true",
  ...(open && {
    // marginLeft: drawerWidth,
    // width: `calc(100% - ${drawerWidth}vw)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));
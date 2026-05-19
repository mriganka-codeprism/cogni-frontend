import { globalStyles } from "../config";

export const transcriptionStyles = {
    link: {
        fontSize: "1.9vh",
        color: "gray",
        cursor: "pointer",
        overflow: "hidden",
        textOverflow: "ellipsis",
        textWrap: "nowrap",
    },
    breadcrumbText: {
        color:globalStyles.colors.primary,
        fontSize: "2vh",
    },
  breadcrumb: {
      // display:'flex',
        alignItems: "center",
        mb:'1vh',
        "& .MuiBreadcrumbs-separator": {
          marginX: "0.5vw",
          fontSize: "2.5vh",
        },
        "& .MuiBreadcrumbs-li": {
          // your styles here
          maxWidth: "30vw",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        },
    },
    interviewId: {
        fontSize:'2.2vh'
    },
    name: {
        fontSize: "1.9vh",
        // color: globalStyles.colors.primary,
        // fontWeight: 600,
        marginBottom: "1vh",
        textTransform:'capitalize'
    },
    heading: {
        fontSize: "2.5vh",
        color: globalStyles.colors.primary,
        fontWeight: 600,
        marginBottom: "1vh",
    },
    paper: {
        p: 2,
        border: "0.1vh solid #bdbdbd",
        height:'60vh'
    },
    box1: {
        overflowY: "auto",
        overflowX: "hidden",
        scrollbarWidth: "thin",
        height: '45vh',
        "&::-webkit-scrollbar": {
            width: "0.5vh",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#c1c1c1",
            borderRadius: "0.5vh",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "none",
          },
          "&::-webkit-scrollbar-button": {
            display: "none",
          },
    },
    youText: {
        color: globalStyles.colors.primary,
        fontSize:'1.8vh'
    },
    botText: {
        color: '#fff',
        fontSize:'1.8vh'
    },
    Schedule:{
      fontSize:'2.5vh'
    },
    box2:{
      width:'100%',
      borderRadius: '2vh',
      overflow: "hidden",
    },
    box3: {
      flex: 1,
      position: "relative",
      padding: '2vh',
      minWidth: "50vw",
      width:'100%'
      // maxWidth: '70vw',
    },
}
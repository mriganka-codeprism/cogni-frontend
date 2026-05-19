export const styles = {
  boxRoot: {
    backgroundColor: "background.default",
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    paddingTop: "9vh",
    paddingRight: "0vh",
    paddingLeft: "0vh",
    scrollbarWidth: "none",
    overflow: "hidden",
    "@media (max-device-width: 480px)": {
      overflow: "hidden",
      overflowY: "auto",
    },
  },

  link: {
    fontSize: "1.9vh",
    color: "gray",
    cursor: "pointer",
    overflow: "hidden",
    textOverflow: "ellipsis",
    textWrap: "nowrap",
  },
  breadcrumb: {
    alignItems: "center",
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
  mainBox: {
    overflow: "hidden",
  },
  breadcrumbbox: {
    height: "5vh",
    alignItems: "center",
    display: "flex",
    padding: "0vh",
    mt: "0vh",
    marginLeft: "0.8vw",
    "@media (max-device-width: 480px)": {
      marginLeft: "2.8vw",
    },
  },
  home: {},
};

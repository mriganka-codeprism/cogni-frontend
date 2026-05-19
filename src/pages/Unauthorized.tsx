import React from "react";
import { Box, Typography } from "@mui/material";

const Unauthorized = () => {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <Typography variant="h3" color="error" gutterBottom>
        401 - Unauthorized
      </Typography>
      <Typography variant="body1" color="textSecondary">
        You do not have permission to view this page.
      </Typography>
    </Box>
  );
};

export default Unauthorized;

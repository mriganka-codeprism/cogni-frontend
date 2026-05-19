import { Box, Typography } from "@mui/material";

const MissingLink = () => (
  <Box sx={{ padding: 4, textAlign: "center" }}>
    <Typography variant="h5" gutterBottom>
      Invalid Access
    </Typography>
    <Typography variant="body1">
      Please use the correct link shared over email or by your coordinator.
    </Typography>
  </Box>
);

export default MissingLink;

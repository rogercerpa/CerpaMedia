import Layout from "../layout/Layout";
import * as React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

const Home = () => {
  return (
    <Layout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh", // or use 'calc(100vh - [HEIGHT_OF_YOUR_HEADER])' if you have a header
        }}
      >
        <h1>Developing</h1>
        <CircularProgress />
      </Box>
    </Layout>
  );
};

export default Home;

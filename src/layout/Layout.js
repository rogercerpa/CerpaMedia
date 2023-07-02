import React from "react";
import Header from "../components/Header/Header";
import { Container } from "./LayoutStyles";

const Layout = ({ children }) => {
  return (
    <Container>
      <Header />
      <main>{children}</main>
    </Container>
  );
};
export default Layout;

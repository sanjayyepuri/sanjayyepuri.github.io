import React from "react";

import { Box, Container, Flex } from "theme-ui";
import { Dimmer, FadeIn, Guide } from "@carbonplan/components";

import { Helmet } from "react-helmet-async";

import Navbar from "./nav";
import Footerbar from "./footer";
import Metadata from "./metadata";

const Header = ({ children }) => (
  <Box
    as="header"
    sx={{
      width: "100%",
      position: "sticky",
      top: 0,
      bg: "background",
			bottom: "0px",
      borderStyle: "solid",
      borderColor: "muted",
      borderWidth: "0px",
      borderBottomWidth: "1px",
			zIndex: 2000
    }}
  >
    {" "}
    {children}{" "}
  </Box>
);

const Main = ({ children }) => (
  <Box
    sx={{
      width: "100%",
      flex: "1 1 auto",
    }}
  >
    {" "}
    {children}{" "}
  </Box>
);

const Footer = ({ children }) => (
  <Box
    as="footer"
    sx={{
      width: "100%",
      bottom: "0px",
      borderStyle: "solid",
      borderColor: "muted",
      borderWidth: "0px",
      borderTopWidth: "1px",
    }}
  >
    {" "}
    {children}{" "}
  </Box>
);

const DimmerContainer = () => (
  <Box
    sx={{
      display: ["none", "none", "initial", "initial"],
      position: ["fixed"],
      right: [13],
      bottom: [17, 17, 15, 16],
    }}
  >
    <Dimmer />
  </Box>
);

const Layout = ({ mode, children }) => (
  <Flex
    sx={{
      flexDirection: "column",
      minHeight: "100vh",
    }}
  >
    <Helmet htmlAttributes={{ lang: "en-us" }}>
      <meta charset="utf-8" />
      <meta name="description" content="Personal blog about math, code and other things" />
      <title>Sanjay Yepuri</title>
    </Helmet>
    <Guide />

    <Header>
      <Container>
        <Navbar />
      </Container>
    </Header>

    <Main>
      <Container>
        <FadeIn duration={250}>{children}</FadeIn>
      </Container>
    </Main>

    <Footer>
      <Footerbar />
    </Footer>
    <Metadata mode={mode}/>
    <DimmerContainer />
  </Flex>
);

export default Layout;

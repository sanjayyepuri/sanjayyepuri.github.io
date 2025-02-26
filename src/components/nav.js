import React from "react";

import { Heading, Box, Text, Flex } from "theme-ui";
import { Link } from "gatsby";

import ArrowButton from "./arrowbutton";

const Navlink = ({ children, to, external = false }) => {
  const button = (
    <ArrowButton color="blue" size={"sm"}>
      {children}
    </ArrowButton>
  );

  return (
    <Flex
      sx={{ pr: [2, 4, 4, 4], alignContent: "center", alignItems: "center", justifyContent: "center" }}
    >
      {external ? (
        <a href={to} target="_blank">
          {" "}
          {button}{" "}
        </a>
      ) : (
        <Link to={to}> {button} </Link>
      )}
    </Flex>
  );
};

const Navbar = () => (
  <Box
    sx={{
      mt: 3,
      pb: 3,
    }}
  >
    <Flex>
      <Heading
        sx={{
          fontWeight: "bold",
          fontSize: [2, 2, 2, 2],
        }}
      >
        <Link to={"/"}>
          <Text sx={{ color: "primary" }}>
            <Text sx={{ fontFamily: "mono", fontSpacing:"mono", color: "blue" }}>/home/sanjay</Text> {" "}
          </Text>
        </Link>
      </Heading>
      <Box sx={{ mx: "auto" }}></Box>
      <Navlink to="/blog"> Blog </Navlink>
      <Navlink
        external={true}
        to="https://drive.google.com/file/d/1OEg4nZAnqHKTMuYdlVuYouBxQqgOX9k0/view"
      >
        Resume
      </Navlink>
    </Flex>

    <Box mt={[1, 3, 3, 3]} mb={[1, 2, 2, 2]}>
      <Text
        sx={{ fontSize: [1, null, null, null], letterSpacing: "smallcaps" }}
      >
        MATH, CODE, AND OTHER THINGS.
      </Text>
    </Box>
  </Box>
);

export default Navbar;

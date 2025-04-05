import React from "react";

import { Box, Heading, Text } from "@theme-ui/components";
import { Row, Column, Callout } from "@carbonplan/components";

const Projects = () => (
  <Box id="projects" mt={[3, 2, 6, 6]} mb={[3, 2, 6, 6]}>
    <Row mb={[1, 2]}>
      <Column start={[1, 1, 2, 2]} width={[3]}>
        <Heading
          sx={{
            fontSize: [4, 5],
            color: "teal",
          }}
        >
          Projects
        </Heading>
      </Column>
    </Row>
    <Row>
      <Column
        start={[1, 1, 2, 2]}
        sx={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <svg
          width="100"
          height="100"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="35" fill="#00BFA6" opacity="0.5" />
          <circle cx="35" cy="35" r="12" fill="#FF4081" opacity="0.7" />
          <circle cx="65" cy="65" r="12" fill="#9C88FF" opacity="0.7" />
          <circle cx="70" cy="30" r="8" fill="#FFD54F" opacity="0.9" />
          <circle cx="30" cy="70" r="8" fill="#FFD54F" opacity="0.9" />
        </svg>
      </Column>
      <Column start={[2, 2, 3, 3]} width={[3]}>
        <a href="/particles" target="_blank">
          <Callout color="primary" label="/particles">
            <Text sx={{ fontFamily: "heading" }}>Fast Fluid Dynamics</Text>
            Playground for physics simulations
          </Callout>
        </a>
      </Column>
    </Row>
    <Row>
      <Column
        start={[1, 1, 2, 2]}
        sx={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <svg
          width="100"
          height="100"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 60 Q 25 40, 50 60 T 100 60 V100 H0 Z"
            fill="#00BFA6"
            opacity="0.6"
          />
          <path
            d="M0 50 Q 30 30, 60 50 T 100 50 V100 H0 Z"
            fill="#FF4081"
            opacity="0.5"
          />
          <path
            d="M0 70 Q 20 50, 40 70 T 100 70 V100 H0 Z"
            fill="#7C4DFF"
            opacity="0.45"
          />
          <path
            d="M0 65 Q 15 55, 35 65 T 100 65 V100 H0 Z"
            fill="#FFD54F"
            opacity="0.4"
          />
        </svg>
      </Column>
      <Column start={[2, 2, 3, 3]} width={[3]}>
        <a href="/fluids" target="_blank">
          <Callout color="primary" label="/fluids">
            <Text sx={{ fontFamily: "heading" }}>Fast Fluid Dynamics</Text>
            A Fast Fluid Dynamics Implementation in Rust+WASM and WebGL
          </Callout>
        </a>
      </Column>
    </Row>
  </Box>
);

export default Projects;

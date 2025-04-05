import React from "react";

import { Box, Heading, Grid } from "@theme-ui/components";
import { Row, Column, Callout } from "@carbonplan/components";

const Project = ({ href, svg, calloutLabel, title, description }) => {
  return (
    // Outer container uses grid to overlap elements.
    <Box
      sx={{
        display: "grid",
        gridTemplateAreas: '"svg" "callout"',
        position: "relative",
      }}
    >
      <Box sx={{ gridArea: "svg" }}>{svg}</Box>

      <Box
        as="a"
        href={href}
        target="_blank"
        sx={{
          gridArea: "callout",
          alignSelf: "start",
          justifySelf: "start",
          textDecoration: "none",
          mt: "-70px",
          ml: "40px",
        }}
      >
        <Callout color="primary" label={calloutLabel}>
          <Heading sx={{ mb: 2, fontSize: "1.5rem" }}>{title}</Heading>
          {description}
        </Callout>
      </Box>
    </Box>
  );
};

const ParticlesSVG = (
  <svg
    width="100"
    height="100"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <clipPath id="clipCircle">
        <circle cx="50" cy="50" r="50" />
      </clipPath>
    </defs>
    <g clip-path="url(#clipCircle)">
      <circle cx="50" cy="50" r="50" fill="#8ecae6" opacity="0.3" />
      <circle cx="30" cy="30" r="10" fill="#ff6ec7" opacity="0.8" />
      <circle cx="70" cy="30" r="10" fill="#9c88ff" opacity="0.8" />
      <circle cx="30" cy="70" r="10" fill="#ffd166" opacity="0.8" />
      <circle cx="70" cy="70" r="10" fill="#ff6ec7" opacity="0.8" />
    </g>
  </svg>
);

const FluidsSVG = (
  <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="clipCircle">
        <circle cx="50" cy="50" r="50"/>
      </clipPath>
    </defs>
    <g clip-path="url(#clipCircle)">
      <path d="M0 60 Q 25 40, 50 60 T100 60 L100 110 L0 110 Z" fill="#009688" opacity="0.7"/>
      <path d="M0 50 Q 30 30, 60 50 T100 50 L100 110 L0 110 Z" fill="#C2185B" opacity="0.65"/>
      <path d="M0 70 Q 20 50, 40 70 T100 70 L100 110 L0 110 Z" fill="#7E57C2" opacity="0.6"/>
      <path d="M0 65 Q 15 55, 35 65 T100 65 L100 110 L0 110 Z" fill="#FFB300" opacity="0.55"/>

      <path d="M0 40 Q 25 60, 50 40 T100 40 L100 -10 L0 -10 Z" fill="#009688" opacity="0.7"/>
      <path d="M0 50 Q 30 70, 60 50 T100 50 L100 -10 L0 -10 Z" fill="#C2185B" opacity="0.65"/>
      <path d="M0 30 Q 20 50, 40 30 T100 30 L100 -10 L0 -10 Z" fill="#7E57C2" opacity="0.6"/>
      <path d="M0 35 Q 15 45, 35 35 T100 35 L100 -10 L0 -10 Z" fill="#FFB300" opacity="0.55"/>
    </g>
  </svg>
);

const Projects = () => (
  <Box id="projects" mt={[3, 2, 6, 6]} mb={[3, 2, 6, 6]}>
    <Row mb={[2, 3]}>
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
    <Row mb={[3, 4]}>
      <Column start={[1, 2]} width={[3]}>
        <Project
          href="/particles"
          svg={ParticlesSVG}
          calloutLabel="/particles"
          title="Particle Physics"
          description="Playground for physics simulations"
        />
      </Column>
      <Column start={[4, 5]} width={[3]}>
        <Project
          href="/fluids"
          svg={FluidsSVG}
          calloutLabel="/fluids"
          title="Fast Fluid Dynamics"
          description="A Fast Fluid Dynamics Implementation in Rust+WASM and WebGL"
        />
      </Column>
    </Row>
  </Box>
);

export default Projects;

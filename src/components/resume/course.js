import React from "react";
import { Box, Text, Heading } from "theme-ui";
import { Row, Column } from "@carbonplan/components";

const CourseList = [
  "Stochastic Processes",
  "Mathematical Statistics",
  "Predictive Analytics",
  "Real Analysis",
  "Algebraic Structures",
  "Neural Networks",
  "Computer Vision",
  "Honors Artificial Intelligence",
  "Honors Computer Graphics",
  "Honors Operating Systems",
  "Honors Concurrency",
  "Honors Quantum Information Theory",
  "Information Retrieval",
  "Programming Languages",
  "Multicore Operating Systems",
];

const CourseWork = () => (
  <Box id="coursework" mt={[3, 2, 6, 6]} mb={[3, 3, 6, 6]}>
    <Row mb={[1, 2]}>
      <Column start={[1, 1, 2, 2]} width={[3]}>
        <Heading
          sx={{
            fontSize: [4, 5],
            color: "pink",
          }}
        >
          Course Work
        </Heading>
      </Column>
    </Row>
    <Row>
      <Column start={[1, 1, 2, 2]} width={[6, 7, 8, 8]}>
        <Text
          sx={{
            color: "secondary",
            fontSize: [2, 3, 3, 4],
            fontFamily: "faux",
            letterSpacing: "faux",
            textTransform: "uppercase",
          }}
        >
          {CourseList.join(" ● ")}
        </Text>
      </Column>
    </Row>
  </Box>
);

export default CourseWork;

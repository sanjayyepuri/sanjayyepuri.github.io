/** @jsx jsx */
import { jsx } from "theme-ui";
import React from "react";

import { graphql, Link } from "gatsby";
import { MDXProvider } from "@mdx-js/react";

import "katex/dist/katex.min.css";

import Layout from "../components/layout";

import { Box, Text } from "theme-ui";
import { Column, Row, Button } from "@carbonplan/components";
import { Left } from "@carbonplan/icons";

const Post = ({ data, children }) => {
  const { blog } = data;
  const [{ frontmatter }] = blog.nodes;

  return (
    <Layout mode="scroll">
      <Row sx={{ mb: [8, 8, 9, 10] }}>
        <Column start={[1, 1, 1, 1]} width={[2]}>
          <Box
            sx={{
              mt: [5, 6, 7, 8],
              mb: [1, 6, 7, 8],
              pt: [2, 2, 2, 2],
            }}
          >
            <Link to={"/blog"}>
              <Button prefix={<Left />}>Back</Button>
            </Link>
          </Box>
        </Column>

        <Column start={[1, 2, 3, 3]} width={[6, 6]}>
          <Box
            as="h1"
            variant="styles.h1"
            sx={{
              mt: [5, 6, 7, 8],
              mb: [5, 6, 7, 8],
            }}
          >
            {frontmatter.title}
          </Box>
          <MDXProvider>{ children }</MDXProvider>
        </Column>

        <Column start={[1, 8, 10, 10]} width={[2, 2, 2, 2]}>
          <Box
            sx={{
              mt: [5, 6, 7, 8],
              mb: [1, 6, 7, 8],
              pt: [2, 2, 2, 2],
            }}
          >
            <Text
              sx={{
                fontFamily: "mono",
                fontSpacing: "mono",
                fontSize: "3",
              }}
            >
              {frontmatter.author.toUpperCase()}
              <br />
              {new Date(frontmatter.date).toDateString().toUpperCase()}
            </Text>
          </Box>
        </Column>
      </Row>
    </Layout>
  );
};

export default Post;

export const query = graphql`
  query BlogQuery($slug: String!) {
    blog: allMdx(filter: { fields: { slug: { eq: $slug } } }) {
      nodes {
        frontmatter {
          date
          title
          author
        }
      }
    }
  }
`;

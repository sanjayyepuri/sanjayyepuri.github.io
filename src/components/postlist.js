import React from "react";
import { graphql, Link, useStaticQuery } from "gatsby";

import { Row, Column } from "@carbonplan/components";
import { Box, Text } from "theme-ui";

import ArrowButton from "./arrowbutton";

const PostPreview = ({ post, divider = true }) => (
  <Box>
    <Row mb={[1, 2]}>
      <Column start={[1, 1, 2, 2]} width={[6, 6, 8, 12]}>
        <Link to={`/blog${post.fields.slug}`}>
          <ArrowButton size="lg">{post.frontmatter.title}</ArrowButton>
        </Link>
      </Column>
    </Row>
    <Row>
      <Column start={[1, 1, 2, 2]} width={[5, 5]}>
        <Text>{post.excerpt}</Text>
      </Column>
      <Column start={[1, 6, 7, 7]} width={[3, 3]}>
        <Text
          sx={{
            letterSpacing: "smallcaps",
            fontFamily: "mono",
            fontSize: 1,
            textTransform: "uppercase",
          }}
        >
          {new Date(post.frontmatter.date).toDateString()}
        </Text>
      </Column>
    </Row>
    <Row>
      <Column start={[1, 1, 2, 2]} width={[6, 8, 8, 8]}>
        {divider && <hr />}
      </Column>
    </Row>
  </Box>
);

const PostList = () => {
  const data = useStaticQuery(graphql`
    {
      blog: allMdx(
        sort: { frontmatter: { date: DESC } }
        filter: { frontmatter: { type: { eq: "post" } } }
      ) {
        posts: nodes {
          fields {
            slug
          }
          excerpt
          frontmatter {
            date
            title
          }
        }
      }
    }
  `);

  const posts = data.blog.posts.slice(0, -1);
  const lastPost = data.blog.posts.slice(-1);

  return (
    <Box mt={[3, 5]} mb={[3, 5]}>
      {posts.map((post) => (
        <PostPreview post={post} />
      ))}
      {lastPost.length > 0 && (
        <PostPreview post={lastPost[0]} divider={false} />
      )}
    </Box>
  );
};

export default PostList;

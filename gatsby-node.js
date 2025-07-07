const { createFilePath } = require("gatsby-source-filesystem");
const path = require("path");

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  if (node.internal.type === "Mdx") {
    const value = createFilePath({ node, getNode });
    createNodeField({
      name: "slug",
      node,
      value,
    });
  }
};

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

  const result = await graphql(`
    {
      blog: allMdx(
        filter: { frontmatter: { type: { eq: "post" } } }
      ) {
        posts: edges {
          post: node {
            fields {
              slug
            }
            internal {
              contentFilePath
            }
          }
        }
      }
    }
  `);


  const postTemplate = path.resolve("src/templates/post.js");

  result.data.blog.posts.forEach((p) => {
    createPage({
      path: `/blog${p.post.fields.slug}`,
      component: `${postTemplate}?__contentFilePath=${p.post.internal.contentFilePath}`,
      context: {
        slug: p.post.fields.slug,
      },
    });
  });
};

import { getBlogPosts } from 'app/writing/utils'

// Ensure basePath is available at static compilation time
export const basePath = process.env.NEXT_PUBLIC_PAGES_BASE_PATH || ''

export const baseUrl = basePath
  ? `https://sanjay.engineering${basePath}`
  : 'https://sanjay.engineering'

export default async function sitemap() {
  let blogs = getBlogPosts().map((post) => ({
    url: `${baseUrl}/writing/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }))

  let routes = ['', '/writing'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  return [...routes, ...blogs]
}

import Link from 'next/link'
import { formatDate, getBlogPosts } from 'app/writing/utils'

export function BlogPosts() {
  let allBlogs = getBlogPosts()

  return (
    <div>
      {allBlogs
        .sort((a, b) => {
          if (
            new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
          ) {
            return -1
          }
          return 1
        })
        .map((post) => (
          <Link
            key={post.slug}
            className="flex hover:underline"
            href={`/writing/${post.slug}`}
          >
            <div className="flex-1">
              <h3>{post.metadata.title}</h3>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-sm text-gray-800 dark:text-gray-500">{post.metadata.publishedAt}</p>
            </div>
          </Link>
        ))}
    </div>
  )
}

import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { highlight } from 'sugar-high'
import React from 'react'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { basePath } from 'app/sitemap'

function Table({ data }) {
  let headers = data.headers.map((header, index) => (
    <th key={index}>{header}</th>
  ))
  let rows = data.rows.map((row, index) => (
    <tr key={index}>
      {row.map((cell, cellIndex) => (
        <td key={cellIndex}>{cell}</td>
      ))}
    </tr>
  ))

  return (
    <div className="table-scroll" role="region" aria-label="Experiment results" tabIndex={0}>
    <table>
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
    </div>
  )
}

function CustomLink(props) {
  let href = props.href

  if (href.startsWith('/')) {
    return (
      <Link href={href} {...props}>
        {props.children}
      </Link>
    )
  }

  if (href.startsWith('#')) {
    return <a {...props} />
  }

  return <a target="_blank" rel="noopener noreferrer" {...props} />
}

function RoundedImage(props) {
  // Handle basePath for images in static export
  let src = props.src

  if (src && src.startsWith('/') && basePath && !src.startsWith(basePath)) {
    src = `${basePath}${src}`
  }

  // For static export, use regular img tag instead of Next.js Image
  // since Image optimization requires a server
  return <img alt={props.alt} className="rounded-lg" {...props} src={src} />
}

function Figure({ src, alt, number, caption, source }: {
  src: string; alt: string; number: string; caption: string; source?: string
}) {
  const href = `${basePath || ''}${src}`
  return (
    <figure className="article-figure">
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`Open figure ${number} at full size`}>
        <img src={href} alt={alt} loading="lazy" decoding="async" />
      </a>
      <figcaption>
        <span className="figure-number">Figure {number}.</span> {caption}{' '}
        <a href={href} target="_blank" rel="noopener noreferrer">Full size</a>
        {source && <> · <a href={source} target="_blank" rel="noopener noreferrer">Experiment report</a></>}
      </figcaption>
    </figure>
  )
}

function Code({ children, ...props }) {
  let codeHTML = highlight(children)
  return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />
}

function slugify(str) {
  return str
    .toString()
    .toLowerCase()
    .trim() // Remove whitespace from both ends of a string
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters except for -
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
}

function createHeading(level) {
  const Heading = ({ children }) => {
    let slug = slugify(children)
    return React.createElement(
      `h${level}`,
      { id: slug },
      [
        React.createElement('a', {
          href: `#${slug}`,
          key: `link-${slug}`,
          className: 'anchor',
        }),
      ],
      children
    )
  }

  Heading.displayName = `Heading${level}`

  return Heading
}

let components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  img: RoundedImage,
  Image: RoundedImage,
  a: CustomLink,
  code: Code,
  Table,
  Figure,
}

export function CustomMDX(props) {
  return (
    <MDXRemote
      {...props}
      components={{ ...components, ...(props.components || {}) }}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
        },
      }}
    />
  )
}

import { BlogPosts } from 'app/components/posts'
import { ExperienceList } from 'app/components/resume'

export const metadata = {
  title: 'Blog',
  description: 'Read my blog.',
}

export default function Page() {
  return (
    <section>
      <h1 className=" section-header mb-8 tracking-tighter">Writing</h1>
      <p className='mb-8'>These posts are random musings and notes rather than well researched prose. They are ideas and threads that greatly interest me and I spend time thinking about and exploring. </p>
      <BlogPosts />
    </section>
  )
}

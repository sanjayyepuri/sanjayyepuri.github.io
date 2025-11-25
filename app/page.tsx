import { BlogPosts } from "app/components/posts";
import { ExperienceList } from "./components/resume";
import { ProjectList } from "./components/projects";

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 tracking-tighter sm:hidden" style={{ fontSize: '22px' }}>
        sanjay <span> • chasing light </span>
      </h1>
      <p className="mb-8 text-[22px] leading-tight">
        {`I build fast and aggressively simple systems. My life lives at the intersection of mathematics, code, and design.
          I believe in first principles, deliberate craftsmanship, and ideas that endure. The rest is just implementation detail.
        `}
      </p>
      <div className="my-8">
        <h3 className="my-2 section-header">Projects</h3>
        <ProjectList />
      </div>
      <div className="my-8">
        <h3 className="my-2 section-header">Writing</h3>
        <BlogPosts />
      </div>
      <div className="my-8">
        <h3 className="my-2 section-header">Experience</h3>
        <ExperienceList />
      </div>
    </section>
  );
}

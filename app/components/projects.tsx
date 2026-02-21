export function ProjectList() {
  const projects = [
    {
      title: "sanjay.party",
      url: "https://sanjay.party",
      description: "Invitations to my parties"
    },
    {
      title: "N-Body Simulation",
      url: "https://sanjay.engineering/particles",
      description: "Physics-based particle system"
    },
    {
      title: "Fast Fluid Dynamics",
      url: "https://sanjay.engineering/fluids",
      description: "Interactive fluid simulation"
    },
  ]

  return (
    <div>
      {projects.map((project) => (
        <a
          key={project.title}
          className="flex hover:underline"
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="flex-1">
            <h3>{project.title}</h3>
          </div>
          <div className="flex flex-col items-end">
            <p className="text-sm text-gray-800 dark:text-gray-500">{project.description}</p>
          </div>
        </a>
      ))}
    </div>
  )
}

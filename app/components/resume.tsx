const experienceItems: Array<{
  title: string;
  company: string;
  startDate: string;
  endDate: string;
}> = [
  {
    title: "Quantitative Research Engineer",
    company: "Citadel | GQS",
    startDate: "Jun. 2025",
    endDate: "Present",
  },
  {
    title: "Quantitative Trading Engineer",
    company: "Citadel | GQS",
    startDate: "Aug. 2021",
    endDate: "Jun. 2025",
  },
  {
    title: "Co-Founder and CTO",
    company: "CovEd",
    startDate: "Apr. 2020",
    endDate: "Dec. 2022",
  },
];

export function ExperienceList() {
  return (
    <ul>
      {experienceItems.map((experience, index) => (
        <li className="flex my-2" key={index}>
          <div className="flex-1">
            <h3>{experience.title}</h3>
            <p className="text-sm text-gray-800 dark:text-gray-500 uppercase">
              {experience.startDate} - {experience.endDate}
            </p>
          </div>
          <div className="flex flex-col items-end">

            <p className="text-sm text-gray-800 dark:text-gray-500">{experience.company}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

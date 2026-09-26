import React from "react";
import { ProjectBoard } from "@/components/projects/ProjectBoard";
import PaperPage from "@/components/paper/PaperPage";

const Projects: React.FC = () => (
  <PaperPage number="03" title="Projects" subtitle="Work that takes more than a day.">
    <ProjectBoard />
  </PaperPage>
);

export default Projects;

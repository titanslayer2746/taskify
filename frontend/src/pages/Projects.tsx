import React from "react";
import { ProjectBoard } from "@/components/projects/ProjectBoard";
import Navbar from "@/components/Navbar";

const Projects: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProjectBoard />
      </div>
    </div>
  );
};

export default Projects;

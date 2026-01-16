import { SkillsPageClient } from "@/features/skills/components/skills-page-client";
import { skillsService } from "@/features/skills/services/skills-service";
import {
  projectsService,
  tasksService,
} from "@/features/projects/services/projects-service";

export default async function SkillsPage() {
  const [projects, taskHistory] = await Promise.all([
    projectsService.listProjects({ revalidate: 60 }),
    tasksService.listHistory({ revalidate: 60 }),
  ]);
  const skills = await skillsService.list({ revalidate: 300 });

  return (
    <SkillsPageClient
      initialProjects={projects}
      initialTaskHistory={taskHistory}
      initialSkills={skills}
    />
  );
}

import * as p from "@clack/prompts";
import { cancelOperation } from "../utils/cancelOperation";
import backend_language from "./backend_language";

export default async function selectProjectType(projectName: string) {
  const projectType = await p.select({
    message: "Pick a project type.",
    options: [
      { value: "frontend", label: "Frontend" },
      { value: "backend", label: "Backend" },
      { value: "both", label: "both", hint: "recommneded" },
    ],
  });

  cancelOperation(projectType);

  // add here
  if (projectType === "backend") {
    await backend_language(projectName);
  }
}

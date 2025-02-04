import * as p from "@clack/prompts";
import cancelOperation from "../utils/cancelOperation";
import selectTSFramework from "./TS_framework";

export default async function selectProjectType() {
  const projectType = await p.select({
    message: "Pick a Language for NodeJS.",
    options: [
      { value: "js", label: "Javascript" },
      { value: "ts", label: "Typescript", hint: "recommneded" },
    ],
  });

  cancelOperation(projectType);
  
// add here
  if (projectType === "ts") {
    await selectTSFramework();
  }
}

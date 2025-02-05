import * as p from "@clack/prompts";
import { cancelOperation } from "../utils/cancelOperation";
import selectDB from "./backend_databases";

export default async function backend_language(projectName: string) {
  const language = await p.select({
    message: "Pick a language for NodeJS.",
    options: [
      { value: "js", label: "Javascript" },
      { value: "ts", label: "Typescript", hint: "recommneded" },
    ],
  });

  cancelOperation(language);
  // add here
  if (language === "ts") {
    await selectDB(projectName);
  }
}

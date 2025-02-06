import * as p from "@clack/prompts";
import { cancelOperation } from "../utils/cancelOperation";
import installFramworkforTS from "../controllers/installFramworkforTS";
import installFramworkforJS from "../controllers/installFramworkforJS";

export async function selectDBforTS(projectName: string) {
  const db = await p.select({
    message: "Pick a language for NodeJS.",
    options: [
      { value: "mongo", label: "MongoDB", hint: "Mongo Atlas" },
      { value: "postgres", label: "Postgres", hint: "Supabase" },
    ],
  });

  cancelOperation(db);
  installFramworkforTS(db, projectName)
}

export async function selectDBforJS(projectName: string) {
  const db = await p.select({
    message: "Pick a language for NodeJS.",
    options: [
      { value: "mongo", label: "MongoDB", hint: "NoSQL" },
      { value: "postgres", label: "Postgres", hint: "SQL" },
    ],
  });
  installFramworkforJS(db, projectName)
  cancelOperation(db);
}

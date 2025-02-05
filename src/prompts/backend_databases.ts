import * as p from "@clack/prompts";
import { cancelOperation } from "../utils/cancelOperation";
import installFramwork from "../controllers/installFramwork";

export default async function selectDB(projectName: string) {
  const db = await p.select({
    message: "Pick a language for NodeJS.",
    options: [
      { value: "mongo", label: "MongoDB", hint: "NoSQL" },
      { value: "postgres", label: "Postgres", hint: "SQL" },
    ],
  });

  cancelOperation(db);
  installFramwork(db, projectName);
}

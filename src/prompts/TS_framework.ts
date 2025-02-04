import * as p from "@clack/prompts";
import cancelOperation from "../utils/cancelOperation";
import installFramwork from "../controllers/installFramwork";

export default async function selectTSFramework() {
  const framework = await p.select({
    message: "Pick a Database.",
    options: [
      { value: "mongo", label: "MongoDB" },
      { value: "postgres", label: "PostgresDB" },
    ],
  });

  cancelOperation(framework);
  await installFramwork(framework);

}


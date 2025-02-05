import * as p from "@clack/prompts";
import color from "picocolors";
import fs from "fs";
import path from "path";
import selectProjectType from "./prompts/projectType";
import { cancelOperation_onlyforProjectName } from "./utils/cancelOperation";


async function main() {
  p.intro(String(color.bgMagenta(color.black(`Example CLI -2`))));

  process.on("SIGINT", () => {
    cancelOperation_onlyforProjectName();
  });

  const projectName = await p.text({
    message: "Name of your project",
    placeholder: "my-app",
  });

  if (p.isCancel(projectName)) {
    cancelOperation_onlyforProjectName();
  }

  // Create the folder if it doesn't exist
  const projectPath = path.join(process.cwd(), projectName as string);
  if (!fs.existsSync(projectPath)) {
    fs.mkdirSync(projectPath, { recursive: true });
    p.log.success(color.green(`Folder created: ${projectPath}`));
  } else {
    p.log.error(color.red(`Folder already exists: ${projectPath}`));
    cancelOperation_onlyforProjectName()
  }

  // Change the working directory to the new project folder
  process.chdir(projectPath);

  await selectProjectType(projectName as string);
}

main();



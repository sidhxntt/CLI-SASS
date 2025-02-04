import * as p from "@clack/prompts";
import color from "picocolors";
import selectProjectType from "./prompts/projectType";

async function main() {
  p.intro(`${color.bgMagenta(color.black(`Example CLI -2`))}`);
  await selectProjectType();
}

main();

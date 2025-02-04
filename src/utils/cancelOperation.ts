import * as p from "@clack/prompts";
import color from "picocolors";

export default function cancelOperation(input: unknown) {
  if (p.isCancel(input)) {
    p.outro(`${color.bgRed(color.white(`Operation Cancelled`))}`);
    process.exit(0);
  }
}

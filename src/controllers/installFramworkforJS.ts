import { spawn } from "child_process";
import { spinner } from "@clack/prompts";
import * as p from "@clack/prompts";
import color from "picocolors";

async function installFramworkforJS(packageName: string | unknown, projectName: string) {
  const s = spinner();
  try {
    let command: string;

    if (packageName === "mongo") {
      command = "npx create-vite@latest";
      s.start("Installing Mongo framework...");
    } else if (packageName === "postgres") {
      s.start("Installing...");
      command = `git clone --single-branch --branch js-postgres https://github.com/sidhxntt/FlashAPI.git . > /dev/null 2>&1`;

      // Wait for the git clone command to finish before stopping the spinner
      const child = spawn(command, {
        stdio: "inherit", // Directly use the parent process's stdin, stdout, and stderr
        shell: true, // Use shell to handle command-line parsing and environment
      });

      child.on("close", (code) => {
        s.stop(`Installation ${code === 0 ? "successful" : "failed"}.`);
        if (code === 0) {
          p.note(`Next steps:
            1. cd ${projectName}/ts-postgres-template
            2. npm install
            3. Checkout README.md for manual

            HAPPY CODING ✨✨`);
        } else {
          p.log.error(color.red("There was an error during installation."));
        }
      });

      child.on("error", (err) => {
        s.stop("Error during installation.");
        p.log.error(color.red(`Error: ${err.message}`));
      });

      return; // Return early since we're handling this command asynchronously
    } else {
      throw new Error(`Unknown package: ${packageName}`);
    }

    // Handle the spawn command for Mongo (if it's not "postgres")
    const child = spawn(command, {
      stdio: "inherit", // Directly use the parent process's stdin, stdout, and stderr
      shell: true, // Use shell to handle command-line parsing and environment
    });

    child.on("error", (err) => {
      s.stop("Error during installation.");
      p.log.error(color.red(`Error: ${err.message}`));
    });

    child.on("close", (code) => {
      s.stop(`Installation ${code === 0 ? "successful" : "failed"}.`);
    });
  } catch (error) {
    s.stop("Error during installation.");
    if (error instanceof Error) {
      p.log.error(color.red(`Failed to install ${packageName}: ${error.message}`));
    }
    p.log.error(color.red(`Unknown error occurred: ${error}`));
  }
}

export default installFramworkforJS;

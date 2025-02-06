import { spawn } from "child_process";
import { spinner } from "@clack/prompts";
import * as p from "@clack/prompts";
import color from "picocolors";

type Framework = "mongo" | "postgres";

interface FrameworkConfig {
  branch: string;
  message: string;
}

async function installFramworkforJS(packageName: Framework | unknown, projectName: string) {
  const s = spinner();
  
  const frameworks: Record<Framework, FrameworkConfig> = {
    mongo: {
      branch: "js-mongo",
      message: "Installing Javascript MongoDB framework..."
    },
    postgres: {
      branch: "js-postgres",
      message: "Installing Javascript Postgres framework..."
    }
  };

  try {
    if (typeof packageName !== "string" || !(packageName in frameworks)) {
      throw new Error(`Unknown package: ${packageName}`);
    }

    const config = frameworks[packageName as Framework];
    s.start(config.message);

    const command = `git clone --single-branch --branch ${config.branch} https://github.com/sidhxntt/FlashAPI.git . > /dev/null 2>&1`;

    const child = spawn(command, {
      stdio: "inherit",
      shell: true,
    });

    await new Promise<void>((resolve, reject) => {
      child.on("error", (err) => {
        s.stop("Error during installation.");
        p.log.error(color.red(`Error: ${err.message}`));
        reject(err);
      });

      child.on("close", (code) => {
        const success = code === 0;
        s.stop(`Installation ${success ? "successful" : "failed"}.`);
        
        if (success) {
          p.note(`Next steps:
            1. cd ${projectName}/${config.branch}-template
            2. npm install
            3. Checkout README.md for manual

            HAPPY CODING ✨✨`);
        }
        
        success ? resolve() : reject(new Error(`Process exited with code ${code}`));
      });
    });
  } catch (error) {
    s.stop("Error during installation.");
    if (error instanceof Error) {
      p.log.error(color.red(`Failed to install ${packageName}: ${error.message}`));
    } else {
      p.log.error(color.red(`Unknown error occurred: ${error}`));
    }
    throw error; // Re-throw to allow caller to handle error
  }
}

export default installFramworkforJS;
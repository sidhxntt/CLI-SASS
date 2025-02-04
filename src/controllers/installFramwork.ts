import { spawn } from "child_process";

async function installFramwork(packageName: string|unknown) {
    try {
      let command: string;
      if (packageName === "mongo") {
        command = "npx create-vite@latest";
      } else if (packageName === "postgres") {
        command = "npx create-next-app@latest";
      } 
      else {
        throw new Error(`Unknown package: ${packageName}`);
      }
  
      const child = spawn(command, {
        stdio: "inherit", // Directly use the parent process's stdin, stdout, and stderr
        shell: true, // Use shell to handle command-line parsing and environment
      });
  
      child.on("error", (err) => {
        console.error(`Error: ${err.message}`);
      });
  
    } catch (error) {
      if (error instanceof Error) {
      console.error(`Failed to install ${packageName}: ${error.message}`);
      }
      console.error(`Unknown error Occured: ${error}`);
    }
  }
export default installFramwork;
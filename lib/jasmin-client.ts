import * as net from "net";

// Default Jasmin CLI connection settings
const DEFAULT_HOST = process.env.JASMIN_HOST || "127.0.0.1";
const DEFAULT_PORT = parseInt(process.env.JASMIN_PORT || "8990");
const DEFAULT_USERNAME = process.env.JASMIN_USERNAME || "jcliadmin";
const DEFAULT_PASSWORD = process.env.JASMIN_PASSWORD || "jclipwd";

/**
 * Execute a command on the Jasmin CLI
 * @param command The command to execute
 * @param options Connection options
 * @returns Promise that resolves with the command output
 */
export async function executeJasminCommand(
  command: string,
  options: {
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    timeout?: number;
  } = {}
): Promise<string> {
  const host = options.host || DEFAULT_HOST;
  const port = options.port || DEFAULT_PORT;
  const username = options.username || DEFAULT_USERNAME;
  const password = options.password || DEFAULT_PASSWORD;
  const timeout = options.timeout || 10000; // 10 seconds default timeout

  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    let buffer = "";
    let authenticated = false;
    let commandSent = false;
    let timeoutId: NodeJS.Timeout;

    // Set timeout
    timeoutId = setTimeout(() => {
      client.destroy();
      reject(new Error("Connection timed out"));
    }, timeout);

    client.connect(port, host, () => {
      console.log(`Connected to Jasmin CLI at ${host}:${port}`);
    });

    client.on("data", (data) => {
      const response = data.toString();
      buffer += response;

      // Handle authentication
      if (!authenticated) {
        if (buffer.includes("Username:")) {
          client.write(`${username}\r\n`);
        } else if (buffer.includes("Password:")) {
          client.write(`${password}\r\n`);
        } else if (buffer.includes("Welcome to Jasmin console")) {
          authenticated = true;
          console.log("Authenticated to Jasmin CLI");
        }
      } 
      // Handle command execution
      else if (authenticated && !commandSent) {
        // Send the command
        client.write(`${command}\r\n`);
        commandSent = true;
      } 
      // Handle command response
      else if (authenticated && commandSent) {
        // Check if the response is complete (prompt is shown again)
        if (buffer.includes("jcli :")) {
          // Remove the prompt and any command echo
          const result = buffer
            .replace(/jcli :/g, "")
            .replace(command, "")
            .trim();
          
          clearTimeout(timeoutId);
          client.destroy();
          resolve(result);
        }
      }
    });

    client.on("error", (err) => {
      clearTimeout(timeoutId);
      client.destroy();
      reject(err);
    });

    client.on("close", () => {
      clearTimeout(timeoutId);
      if (!commandSent || (commandSent && !buffer.includes("jcli :"))) {
        reject(new Error("Connection closed before command completion"));
      }
    });
  });
}
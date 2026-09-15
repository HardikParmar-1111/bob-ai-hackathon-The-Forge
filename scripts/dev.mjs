import { spawn } from "child_process";

console.log("🚀 Starting AegisTrial GCP Copilot development environment...");
console.log("   • API Server: http://localhost:5001");
console.log("   • Frontend Web: http://localhost:3000");

const apiEnv = {
  ...process.env,
  PORT: process.env.API_PORT || process.env.PORT || "5001",
  NODE_ENV: "development",
};

const webEnv = {
  ...process.env,
  PORT: process.env.WEB_PORT || "3000",
  BASE_PATH: process.env.BASE_PATH || "/",
  API_URL: `http://localhost:${apiEnv.PORT}`,
};

const apiProcess = spawn("npm", ["run", "dev", "--workspace=api-server"], {
  stdio: "inherit",
  shell: true,
  env: apiEnv,
});

const webProcess = spawn("npm", ["run", "dev", "--workspace=clinical-trial-risk-monitor"], {
  stdio: "inherit",
  shell: true,
  env: webEnv,
});

function cleanup() {
  console.log("\nShutting down dev servers...");
  apiProcess.kill();
  webProcess.kill();
  process.exit(0);
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
process.on("exit", cleanup);

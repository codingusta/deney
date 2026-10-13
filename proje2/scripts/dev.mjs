import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const venvPython = resolve(root, process.platform === "win32" ? ".venv/Scripts/python.exe" : ".venv/bin/python");
const python = existsSync(venvPython) ? venvPython : process.env.PYTHON ?? "python";
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const children = [
  spawn(npm, ["run", "dev:web"], { cwd: root, stdio: "inherit", shell: process.platform === "win32" }),
  spawn(python, ["server.py"], { cwd: root, stdio: "inherit" }),
];

function stopChildren() {
  children.forEach((child) => child.kill("SIGTERM"));
}

process.on("SIGINT", stopChildren);
process.on("SIGTERM", stopChildren);
children.forEach((child) => child.on("exit", (code) => {
  if (code && code !== 0) process.exitCode = code;
  stopChildren();
}));

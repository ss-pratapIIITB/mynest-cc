#!/usr/bin/env node
// Generate a CEO_PASSWORD_HASH value for the /ceo section.
//
// Usage:
//   node scripts/hash-password.mjs "your-new-password"
//   node scripts/hash-password.mjs            (prompts, hides input)
//
// Copy the printed CEO_PASSWORD_HASH line into .env.local and into your
// Vercel project's environment variables. Also rotate CEO_SESSION_SECRET
// (printed below) if you want to invalidate all existing sessions.

import { randomBytes, scryptSync } from "node:crypto";
import { createInterface } from "node:readline";

function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

async function promptHidden(question) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const originalWrite = rl._writeToOutput;
    let masked = false;
    rl._writeToOutput = function (str) {
      if (masked) return;
      originalWrite.call(rl, str);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
    masked = true;
  });
}

const arg = process.argv[2];
const password = arg ?? (await promptHidden("New password: "));

if (!password || password.length < 12) {
  console.error("Password must be at least 12 characters.");
  process.exit(1);
}

console.log("\nCEO_PASSWORD_HASH=" + hashPassword(password));
console.log(
  "\n(Optional) rotate the session secret to log out all existing sessions:\nCEO_SESSION_SECRET=" +
    randomBytes(32).toString("hex")
);

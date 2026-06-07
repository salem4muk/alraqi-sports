import { rm } from "node:fs/promises";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const nextDir = join(process.cwd(), ".next");
const maxAttempts = 8;

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  try {
    await rm(nextDir, { recursive: true, force: true });
    process.exit(0);
  } catch (error) {
    if (!["EBUSY", "EPERM", "ENOTEMPTY"].includes(error?.code) || attempt === maxAttempts) {
      console.error(`Failed to clean ${nextDir}: ${error.message}`);
      process.exit(1);
    }

    await delay(attempt * 250);
  }
}

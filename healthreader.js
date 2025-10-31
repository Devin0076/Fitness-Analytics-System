// Reads JSON health data asynchronously, counts entries, and handles errors.

const fs = require("fs").promises;

/** Read and parse a JSON file that should contain an array of entries. */
async function readHealthJson(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error("Invalid JSON: expected an array of entries");
    }
    return parsed;
  } catch (err) {
    if (err.code === "ENOENT") {
      throw new Error(`Health data file not found at ${filePath}`);
    }
    if (err.name === "SyntaxError") {
      throw new Error(`Invalid JSON in ${filePath}`);
    }
    throw err;
  }
}

/** Return the number of health entries. */
async function countHealthEntries(filePath) {
  const entries = await readHealthJson(filePath);
  return entries.length;
}

module.exports = {
  readHealthJson,
  countHealthEntries,
};

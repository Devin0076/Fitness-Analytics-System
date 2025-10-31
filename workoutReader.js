// Uses csv-parser to read CSV workout data, counts workouts,
// calculates total minutes, and handles errors.

const fs = require("fs");
const csv = require("csv-parser");

/** Read the workouts CSV and return an array of row objects. */
function readWorkoutCsv(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    const stream = fs
      .createReadStream(filePath)
      .on("error", (err) => {
        if (err.code === "ENOENT") {
          reject(new Error(`Workout data file not found at ${filePath}`));
        } else {
          reject(err);
        }
      })
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("error", () => reject(new Error(`Corrupted CSV at ${filePath}`)))
      .on("end", () => resolve(rows));
  });
}

/** Count total workouts (rows) in the CSV file. */
async function countWorkouts(filePath) {
  const rows = await readWorkoutCsv(filePath);
  return rows.length;
}

/** Sum minutes from a given column (default: "minutes"). Non-numeric values are ignored. */
async function calculateTotalMinutes(filePath, minutesField = "minutes") {
  const rows = await readWorkoutCsv(filePath);
  if (rows.length && !(minutesField in rows[0])) {
    throw new Error(
      `CSV is missing expected column "${minutesField}". ` +
      `Available columns: ${Object.keys(rows[0]).join(", ")}`
    );
  }
  let total = 0;
  for (const r of rows) {
    const v = Number(r[minutesField]);
    if (!Number.isNaN(v)) total += v;
  }
  return total;
}

module.exports = {
  readWorkoutCsv,
  countWorkouts,
  calculateTotalMinutes,
};

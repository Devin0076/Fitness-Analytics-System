const fs = require("fs");
const csv = require("csv-parser");

/** Read the workouts CSV and return an array of row objects. */
function readWorkoutCsv(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    let headerProblem = false;
    let sawHeaders = false;

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
      .on("headers", (headers) => {
        sawHeaders = true;
        const required = ["date", "type", "minutes"];
        if (
          !headers ||
          headers.length === 0 ||
          !required.every((h) => headers.includes(h))
        ) {
          headerProblem = true;
        }
      })
      .on("data", (row) => rows.push(row))
      .on("error", () => reject(new Error(`Corrupted CSV at ${filePath}`)))
      .on("end", () => {
        if (!sawHeaders || headerProblem) {
          return reject(new Error(`Corrupted CSV at ${filePath}`));
        }
        resolve(rows);
      });
  });
}

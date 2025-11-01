// Main program: loads env vars, calls both readers with async/await, and prints a summary.

require("dotenv").config();

const { countHealthEntries } = require("./healthReader");
const { countWorkouts, calculateTotalMinutes } = require("./workoutReader");

/**
 * Orchestrate reading workout CSV + health JSON and print a summary.
 */
async function processFiles({
  healthPath = "./data/health.json",
  workoutPath = "./data/workouts.csv",
  minutesField = "minutes",
} = {}) {
  const user = process.env.USER_NAME || "User";
  const goal = Number(process.env.WEEKLY_GOAL) || 0;

  console.log(`Processing data for: ${user}`);

  try {
    console.log("Reading workout data...");
    const [workouts, minutes] = await Promise.all([
      countWorkouts(workoutPath),
      calculateTotalMinutes(workoutPath, minutesField),
    ]);
    console.log(`Total workouts: ${workouts}`);
    console.log(`Total minutes: ${minutes}`);

    console.log("Reading health data...");
    const healthCount = await countHealthEntries(healthPath);
    console.log(`Total health entries: ${healthCount}`);

    console.log("\n=== SUMMARY ===");
    console.log(`Workouts found: ${workouts}`);
    console.log(`Total workout minutes: ${minutes}`);
    console.log(`Health entries found: ${healthCount}`);
    console.log(`Weekly goal: ${goal} minutes`);

    if (goal > 0) {
      if (minutes >= goal) {
        console.log(`Congratulations ${user}! You have met or exceeded your weekly goal!`);
      } else {
        console.log(`${user}, you are ${goal - minutes} minutes away from your weekly goal. Keep going!`);
      }
    }

    return { user, goal, workouts, minutes, healthCount };
  } catch (err) {
    console.error("Error processing files:", err.message);
    throw err;
  }
}

if (require.main === module) {
  processFiles().catch(() => process.exit(1));
}

module.exports = { processFiles };

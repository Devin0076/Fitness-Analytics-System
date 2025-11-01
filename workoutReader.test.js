const fs = require("fs").promises;
const path = require("path");
const os = require("os");
const { readWorkoutCsv, countWorkouts, calculateTotalMinutes } = require("./workoutReader");

describe("workoutReader", () => {
  let tmpDir;
  let csvPath;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "workouts-"));
    csvPath = path.join(tmpDir, "workouts.csv");
  });

  afterEach(async () => {
    try { await fs.rm(tmpDir, { recursive: true, force: true }); } catch {}
  });

  const writeCsv = async (text) => {
    await fs.writeFile(csvPath, text);
  };

  test("reads valid CSV and returns rows", async () => {
    await writeCsv("date,type,minutes\n2025-01-01,run,30\n2025-01-02,lift,45\n");
    const rows = await readWorkoutCsv(csvPath);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ type: "run", minutes: "30" });
  });

  test("counts total workouts", async () => {
    await writeCsv("date,type,minutes\n2025-01-01,run,30\n2025-01-02,lift,45\n2025-01-03,swim,20\n");
    const count = await countWorkouts(csvPath);
    expect(count).toBe(3);
  });

  test("calculates total minutes (ignores non-numeric)", async () => {
    await writeCsv("date,type,minutes\n2025-01-01,run,30\n2025-01-02,lift,foo\n2025-01-03,swim,20\n");
    const total = await calculateTotalMinutes(csvPath);
    expect(total).toBe(50);
  });

  test("supports a custom minutes field name", async () => {
    await writeCsv("date,type,duration\n2025-01-01,run,30\n2025-01-02,lift,40\n");
    const total = await calculateTotalMinutes(csvPath, "duration");
    expect(total).toBe(70);
  });

  test("throws helpful error when file is missing", async () => {
    await expect(readWorkoutCsv(path.join(tmpDir, "missing.csv"))).rejects.toThrow(/Workout data file not found/);
  });

  test("errors on corrupted CSV", async () => {
    await writeCsv('"unclosed,quote\n');
    await expect(readWorkoutCsv(csvPath)).rejects.toThrow(/Corrupted CSV/);
  });
});

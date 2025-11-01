const fs = require("fs").promises;
const path = require("path");
const os = require("os");
const { readHealthJson, countHealthEntries } = require("./healthReader");

describe("healthReader", () => {
  let tmpDir;
  let jsonPath;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "health-"));
    jsonPath = path.join(tmpDir, "health.json");
  });

  afterEach(async () => {
    try { await fs.rm(tmpDir, { recursive: true, force: true }); } catch {}
  });

  test("reads valid JSON array and returns entries", async () => {
    await fs.writeFile(jsonPath, JSON.stringify([{ a: 1 }, { a: 2 }, { a: 3 }]));
    const entries = await readHealthJson(jsonPath);
    expect(Array.isArray(entries)).toBe(true);
    expect(entries).toHaveLength(3);
  });

  test("counts entries correctly", async () => {
    await fs.writeFile(jsonPath, JSON.stringify([{ x: 1 }, { x: 2 }]));
    const count = await countHealthEntries(jsonPath);
    expect(count).toBe(2);
  });

  test("throws helpful error when file is missing", async () => {
    await expect(readHealthJson(path.join(tmpDir, "missing.json"))).rejects.toThrow(/Health data file not found/);
  });

  test("throws helpful error on invalid JSON", async () => {
    await fs.writeFile(jsonPath, "{bad json");
    await expect(readHealthJson(jsonPath)).rejects.toThrow(/Invalid JSON/);
  });

  test("throws error when JSON is not an array", async () => {
    await fs.writeFile(jsonPath, JSON.stringify({ not: "array" }));
    await expect(readHealthJson(jsonPath)).rejects.toThrow(/expected an array/);
  });
});

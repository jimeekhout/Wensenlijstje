import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const dir = mkdtempSync(path.join(tmpdir(), "wensenlijstje-"));
process.env.WENSENLIJSTJE_DB = path.join(dir, "test.db");

import { writeFileSync } from "fs"

writeFileSync("dist/package.json", JSON.stringify({ type: "commonjs" }) + "\n")

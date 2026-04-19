const fs = require("fs");
const path = require("path");

const iconsDir = path.join(__dirname, "..", "assets", "icons");
const outPutfile = path.join(iconsDir, "index.ts");

const files = fs.readdirSync(iconsDir).filter((f) => f.endsWith(".svg"));

const lines = files.map((f) => {
  const name = path.parse(f).name;
  // const exportId = name
  //     .split('-')
  //     .map((part, index) => index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1))
  //     .join('');
  return `export { default as '${name}' } from './${name}.svg';`;
});

fs.writeFileSync(outPutfile, lines.join("\n"));
console.log(`Generated icons index with ${files.length} icons.`);

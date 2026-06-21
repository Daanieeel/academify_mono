const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const selectionJsonPath = path.join(
  __dirname,
  '../assets/icomoon/selection.json',
);
const selection = JSON.parse(fs.readFileSync(selectionJsonPath, 'utf8'));

const targetIcons = ['chat-circle', 'binoculars', 'megaphone-simple', 'wrench'];
const outputDir = path.join(__dirname, '../assets/images/app/tabs');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

targetIcons.forEach((iconName) => {
  const iconData = selection.icons.find((i) => i.properties.name === iconName);
  if (!iconData) {
    console.error(`Icon ${iconName} not found`);
    return;
  }

  const paths = iconData.icon.paths
    .map((p) => `<path d="${p}" fill="black" />`)
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">${paths}</svg>`;

  const svgPath = path.join(outputDir, `${iconName}.svg`);
  fs.writeFileSync(svgPath, svg);

  // Convert to PNG at 3 sizes: 24x24 (1x), 48x48 (2x), 72x72 (3x)
  // For iOS template rendering, the color doesn't matter, we use black.

  try {
    execSync(
      `npx -y sharp-cli resize 24 24 -i ${svgPath} -o ${path.join(outputDir, `${iconName}.png`)}`,
    );
    execSync(
      `npx -y sharp-cli resize 48 48 -i ${svgPath} -o ${path.join(outputDir, `${iconName}@2x.png`)}`,
    );
    execSync(
      `npx -y sharp-cli resize 72 72 -i ${svgPath} -o ${path.join(outputDir, `${iconName}@3x.png`)}`,
    );
    console.log(`Generated PNGs for ${iconName}`);
  } catch (err) {
    console.error(`Failed to generate PNGs for ${iconName}`, err.message);
  }
});

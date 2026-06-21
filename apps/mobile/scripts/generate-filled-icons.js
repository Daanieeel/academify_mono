const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetIcons = ['chat-circle', 'binoculars', 'megaphone-simple', 'wrench'];
const outputDir = path.join(__dirname, '../assets/images/app/tabs');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

targetIcons.forEach((iconName) => {
  const url = `https://raw.githubusercontent.com/phosphor-icons/core/main/assets/fill/${iconName}-fill.svg`;
  const svgPath = path.join(outputDir, `${iconName}-fill.svg`);

  try {
    execSync(`curl -s -o ${svgPath} ${url}`);

    // Replace fill color if needed, but for iOS template it doesn't matter (usually black is fine)
    // Phosphor SVGs use currentColor, let's replace with black just in case sharp-cli drops it
    let svgContent = fs.readFileSync(svgPath, 'utf8');
    svgContent = svgContent.replace('fill="currentColor"', 'fill="black"');
    fs.writeFileSync(svgPath, svgContent);

    execSync(
      `npx -y sharp-cli resize 24 24 -i ${svgPath} -o ${path.join(outputDir, `${iconName}-fill.png`)}`,
    );
    execSync(
      `npx -y sharp-cli resize 48 48 -i ${svgPath} -o ${path.join(outputDir, `${iconName}-fill@2x.png`)}`,
    );
    execSync(
      `npx -y sharp-cli resize 72 72 -i ${svgPath} -o ${path.join(outputDir, `${iconName}-fill@3x.png`)}`,
    );
    console.log(`Generated filled PNGs for ${iconName}`);
  } catch (err) {
    console.error(
      `Failed to generate filled PNGs for ${iconName}`,
      err.message,
    );
  }
});

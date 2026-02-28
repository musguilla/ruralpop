const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

async function createSplash() {
    // Canvas size for splash should be around 2048x2048 or 1242x2688 
    const width = 1242;
    const height = 2688;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background color based on user's image (approximate hex)
    ctx.fillStyle = '#1D2422';
    ctx.fillRect(0, 0, width, height);

    // Load logo
    const img = await loadImage('./logo.png');

    // Scale logo up to a good size for splash (e.g., maintain aspect ratio, maybe 500px wide)
    const newWidth = 600;
    const newHeight = (img.height / img.width) * newWidth;

    // Center the logo
    const x = (width - newWidth) / 2;
    const y = (height - newHeight) / 2;

    ctx.drawImage(img, x, y, newWidth, newHeight);

    // Write to file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('./splash-icon.png', buffer);
    console.log("Splash generated");
}

async function createAdaptiveIcon() {
    // Adaptive icon must be 1080x1080, logo inside center 66% (about 700px max)
    const iconSize = 1080;
    const canvas = createCanvas(iconSize, iconSize);
    const ctx = canvas.getContext('2d');

    // Make the foreground image have transparent border or dark bg
    ctx.fillStyle = '#1D2422';
    ctx.fillRect(0, 0, iconSize, iconSize);

    const img = await loadImage('./logo.png');

    // Safe zone is inner 66% = 712px. Logo should fit inside.
    const newWidth = 500;
    const newHeight = (img.height / img.width) * newWidth;

    const x = (iconSize - newWidth) / 2;
    const y = (iconSize - newHeight) / 2;

    ctx.drawImage(img, x, y, newWidth, newHeight);

    // Write to file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('./adaptive-icon.png', buffer);
    console.log("Adaptive icon generated");

    // Also save exactly for iOS basic icon
    fs.writeFileSync('./icon.png', buffer);
}

createSplash().then(createAdaptiveIcon).catch(console.error);

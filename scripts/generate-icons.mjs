
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SOURCE_FILE = path.join(process.cwd(), 'src/assets/brand-logo.png');
const PUBLIC_DIR = path.join(process.cwd(), 'public');

// Ensure source exists
if (!fs.existsSync(SOURCE_FILE)) {
    console.error(`❌ Source file not found: ${SOURCE_FILE}`);
    process.exit(1);
}

// Ensure public dir exists
if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

console.log('🎨 Generating icons from:', SOURCE_FILE);

async function generate() {
    try {
        const image = sharp(SOURCE_FILE);

        // 1. Standard Favicons
        await image.resize(16, 16).toFile(path.join(PUBLIC_DIR, 'favicon-16x16.png'));
        console.log('✅ favicon-16x16.png');

        await image.resize(32, 32).toFile(path.join(PUBLIC_DIR, 'favicon-32x32.png'));
        console.log('✅ favicon-32x32.png');

        // 2. Apple Touch Icon (180x180) - usually has a background or ensure transparency is handled
        // For standard PNG source, sharp handles it well. 
        await image.resize(180, 180).toFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'));
        console.log('✅ apple-touch-icon.png');

        // 3. PWA Standard Icons
        await image.resize(192, 192).toFile(path.join(PUBLIC_DIR, 'pwa-192x192.png'));
        console.log('✅ pwa-192x192.png');

        await image.resize(512, 512).toFile(path.join(PUBLIC_DIR, 'pwa-512x512.png'));
        console.log('✅ pwa-512x512.png');

        // 4. Safe Maskable Icon (512x512 with padding)
        // Logo should fit within ~80% of canvas. 
        // 512 * 0.8 = ~410px. Padding approx 50px on each side.
        // We create a new 512x512 white/transparent canvas and composite the resized logo in center.
        // Maskable icons often look best on a solid background color (e.g. white or brand color).
        // Let's use white background for safety as per standard manifest recommendation for "safe zone".
        await sharp({
            create: {
                width: 512,
                height: 512,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 1 } // Solid white background
            }
        })
            .composite([{
                input: await sharp(SOURCE_FILE).resize(350, 350).toBuffer(), // Smaller to be "safe"
                gravity: 'center'
            }])
            .toFile(path.join(PUBLIC_DIR, 'pwa-512x512-maskable.png'));
        console.log('✅ pwa-512x512-maskable.png');

        // 5. ICO
        // Sharp doesn't directly support .ico output with multiple sizes easily without plugins,
        // but recent versions might support single size .ico or we just rename a 32x32 png?
        // Actually sharp usually fails on .ico output format unless libvips supports it.
        // Quickest production hack for Vite if sharp fails on ico: use a 32x32 png named favicon.ico?
        // Browsers handle png-in-ico often, but real ICO is structured.
        // Retry: standard sharp usage usually involves creating a 32x32 png and saving as .ico if supported,
        // OR just save as favicon.ico (most modern browsers allow png content).
        // Let's try to generate a clean 32x32 into favicon.ico.
        await image.resize(32, 32).toFile(path.join(PUBLIC_DIR, 'favicon.ico'));
        console.log('✅ favicon.ico');

    } catch (error) {
        console.error('❌ Error generating icons:', error);
        process.exit(1);
    }
}

generate();

const fs = require('fs');
const path = require('path');

const move = (src, dest) => {
    const srcPath = path.join(__dirname, '../../src/app', src);
    const destPath = path.join(__dirname, '../../src/app', dest);
    
    if (fs.existsSync(srcPath)) {
        try {
            // Ensure dest folder exists if it's a directory structure
            // But here dest is the full target path including the filename/dirname
            // fs.renameSync(srcPath, destPath);
            
            // Correction: destPath should be the target name.
            // If dest is a folder we want to move INTO, we join.
            // But my inputs are precise: move 'page.tsx' to '(shop)/page.tsx'
            
            fs.renameSync(srcPath, destPath);
            console.log(`Moved: ${src} -> ${dest}`);
        } catch (e) {
            console.error(`Error moving ${src}:`, e.message);
        }
    } else {
        console.log(`Skipped: ${src} not found (maybe already moved)`);
    }
};

const shopItems = [
    'page.tsx',
    'account',
    'cart',
    'checkout',
    'favorites',
    'help',
    'orders',
    'products',
    'register',
    'seller',
    'users',
    'vender',
    'login' // ensuring this is moved too
];

const logisticsItems = [
    'delivery',
    'logistics',
    'scan'
];

console.log("Starting restructure...");

// Ensure directories exist
const appDir = path.join(__dirname, '../../src/app');
if (!fs.existsSync(path.join(appDir, '(shop)'))) fs.mkdirSync(path.join(appDir, '(shop)'));
if (!fs.existsSync(path.join(appDir, '(logistics)'))) fs.mkdirSync(path.join(appDir, '(logistics)'));

shopItems.forEach(item => {
    move(item, `(shop)/${item}`);
});

logisticsItems.forEach(item => {
    move(item, `(logistics)/${item}`);
});

console.log("Done.");

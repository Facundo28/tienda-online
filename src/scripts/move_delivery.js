const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '../../src/app/delivery');
const dest = path.join(__dirname, '../../src/app/(logistics)/delivery');

if (fs.existsSync(src)) {
    try {
        fs.renameSync(src, dest);
        console.log("Moved delivery successfully.");
    } catch (e) {
        console.error("Move failed:", e);
    }
} else {
    console.log("Source not found:", src);
}

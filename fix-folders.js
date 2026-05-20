const fs = require('fs');
const path = require('path');

const appDir = path.join(process.cwd(), 'src', 'app');

// Find all directories that look like [locale] even with weird backslashes or brackets
const folders = fs.readdirSync(appDir).filter(f => f.includes('[locale'));

console.log('Found folders:', folders);

const targetDir = path.join(appDir, '[locale]');

// Create target if not exists
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir);
}

folders.forEach(f => {
    const folderPath = path.join(appDir, f);
    if (f === '[locale]') return; // Skip target

    if (fs.lstatSync(folderPath).isDirectory()) {
        const files = fs.readdirSync(folderPath);
        files.forEach(file => {
            const oldPath = path.join(folderPath, file);
            const newPath = path.join(targetDir, file);
            console.log(`Moving ${oldPath} to ${newPath}`);
            fs.renameSync(oldPath, newPath);
        });
        // Remove old folder if empty
        // fs.rmdirSync(folderPath, { recursive: true });
    } else {
        // If it's a file named [locale], delete it
        fs.unlinkSync(folderPath);
    }
});

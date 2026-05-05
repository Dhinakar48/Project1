const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    if (fs.lstatSync(filePath).isDirectory()) {
        fs.readdirSync(filePath).forEach(child => replaceInFile(path.join(filePath, child)));
        return;
    }

    if (!filePath.endsWith('.jsx') && !filePath.endsWith('.js')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('127.0.0.1:5000')) {
        console.log(`Updating ${filePath}`);
        const updated = content.replace(/127\.0\.0\.1:5000/g, 'localhost:5000');
        fs.writeFileSync(filePath, updated);
    }
}

replaceInFile('./frontend/src');

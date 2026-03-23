const fs = require('fs');
const content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const lines = content.split('\n');
lines.forEach((line, index) => {
    if (line.includes('fetchData')) {
        console.log(`${index + 1}: ${line}`);
    }
});

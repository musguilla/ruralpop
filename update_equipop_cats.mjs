import fs from 'fs';

const newData = JSON.parse(fs.readFileSync('equipop_cats.json', 'utf8'));
const replacementStr = 'export const EQUIPOP_CATEGORIES = ' + JSON.stringify(newData, null, 4) + ';';

function updateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const regex = /export const EQUIPOP_CATEGORIES = \[[\s\S]*?\];/m;
    if (regex.test(content)) {
        content = content.replace(regex, replacementStr);
        fs.writeFileSync(filePath, content);
        console.log('Updated ' + filePath);
    } else {
        console.error('Could not find EQUIPOP_CATEGORIES in ' + filePath);
    }
}

updateFile('ruralpop-mobile/src/constants/categories.ts');
updateFile('src/constants/categories.ts');

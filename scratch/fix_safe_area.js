const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('/Users/luis/Personal/__RURALPOP/ruralpopv1/ruralpop-mobile/app');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    const rnImportRegex = /import\s+{([^}]*?)}\s+from\s+['"]react-native['"]/g;
    
    let match;
    let modified = false;
    
    // We might have multiple react-native imports, but usually just one.
    // Replace SafeAreaView from react-native imports
    if (content.includes("SafeAreaView") && !content.includes("import { SafeAreaView } from 'react-native-safe-area-context'")) {
        content = content.replace(rnImportRegex, (fullMatch, importGroup) => {
            const imports = importGroup.split(',').map(s => s.trim()).filter(Boolean);
            if (imports.includes('SafeAreaView')) {
                modified = true;
                const newImports = imports.filter(i => i !== 'SafeAreaView');
                if (newImports.length > 0) {
                    return `import { ${newImports.join(', ')} } from 'react-native';`;
                } else {
                    return ''; // Removed all imports
                }
            }
            return fullMatch;
        });
        
        if (modified) {
            // Add the new import right after the react-native import, or at the top
            // Let's just insert it after the last react-native import
            content = content.replace(/import\s+{([^}]*?)}\s+from\s+['"]react-native['"];?/, (match) => {
                return match + `\nimport { SafeAreaView } from 'react-native-safe-area-context';`;
            });
            fs.writeFileSync(file, content, 'utf8');
            console.log('✅ Fixed:', file);
        }
    }
});

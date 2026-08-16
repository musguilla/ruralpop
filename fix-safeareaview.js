const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(file));
        } else if (file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walkDir('ruralpop-mobile/app');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if it imports SafeAreaView from react-native
    if (content.match(/import\s+{([^}]*?)SafeAreaView([^}]*?)}\s+from\s+['"]react-native['"]/)) {
        // Remove SafeAreaView from react-native import
        content = content.replace(/import\s+{([^}]*?)SafeAreaView([^}]*?)}\s+from\s+['"]react-native['"];?/, (match, p1, p2) => {
            const imports = (p1 + p2).split(',').map(s => s.trim()).filter(s => s);
            if (imports.length === 0) return '';
            return `import { ${imports.join(', ')} } from 'react-native';`;
        });
        
        // Add SafeAreaView to react-native-safe-area-context import
        if (content.includes("from 'react-native-safe-area-context'")) {
            content = content.replace(/import\s+{([^}]+)}\s+from\s+['"]react-native-safe-area-context['"];?/, (match, p1) => {
                if (p1.includes('SafeAreaView')) return match;
                return `import { ${p1.trim()}, SafeAreaView } from 'react-native-safe-area-context';`;
            });
        } else {
            // Add new import after the react-native import
            content = content.replace(/(import .* from 'react-native';?)/, "$1\nimport { SafeAreaView } from 'react-native-safe-area-context';");
        }
        
        fs.writeFileSync(file, content);
        console.log("Fixed:", file);
    }
});

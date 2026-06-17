const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('page.tsx')) results.push(file);
        }
    });
    return results;
}

const files = walk('src/app/tractores');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Check if it has params: { ... } in Props
    if (content.includes('params: {') && !content.includes('params: Promise<{')) {
        content = content.replace(/params:\s*{\s*(.*?)\s*}/g, 'params: Promise<{ $1 }>');
        changed = true;
    }

    // Fix generateMetadata
    if (content.match(/export async function generateMetadata\(\s*\{\s*params\s*\}\s*:\s*Props\s*\)/)) {
        content = content.replace(/export async function generateMetadata\(\s*\{\s*params\s*\}\s*:\s*Props\s*\)/, 'export async function generateMetadata(props: Props)');
        content = content.replace(/const supabase = await createClient\(\);/g, 'const params = await props.params;\n    const supabase = await createClient();');
        changed = true;
    }

    // Fix Page
    if (content.match(/export default function Page\(\s*\{\s*params\s*\}\s*:\s*Props\s*\)/)) {
        content = content.replace(/export default function Page\(\s*\{\s*params\s*\}\s*:\s*Props\s*\)/, 'export default async function Page(props: Props)');
        content = content.replace(/return <TractorFeature/g, 'const params = await props.params;\n    return <TractorFeature');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed', file);
    }
});

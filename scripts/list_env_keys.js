require('dotenv').config({ path: '.env.local' });
console.log("Env keys in .env.local:", Object.keys(process.env).filter(k => !k.startsWith('npm_') && !k.startsWith('VSCODE_')));

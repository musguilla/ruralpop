import fs from 'fs';

async function main() {
    const stateStr = fs.readFileSync('/Users/luis/.expo/state.json', 'utf8');
    const state = JSON.parse(stateStr);
    const sessionSecret = state.auth.sessionSecret;
    
    const res = await fetch('https://api.expo.dev/v2/submissions/3d2744c9-bd03-4438-bdb1-50015167173c', {
        headers: {
            'expo-session': sessionSecret
        }
    });
    
    const data = await res.text();
    console.log(data);
}

main().catch(console.error);

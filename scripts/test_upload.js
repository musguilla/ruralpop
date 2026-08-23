require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

async function main() {
    const formData = new FormData();
    const blob = new Blob(['test image data'], { type: 'image/webp' });
    formData.append('file', blob, 'test.webp');
    formData.append('folder', 'test');

    const res = await fetch('http://localhost:3000/api/upload/direct', {
        method: 'POST',
        body: formData
    });

    console.log(res.status);
    console.log(await res.text());
}
main();

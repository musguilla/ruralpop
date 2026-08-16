const fs = require('fs');
const easPath = 'ruralpop-mobile/eas.json';
let eas = JSON.parse(fs.readFileSync(easPath, 'utf8'));

// Set Android image for both profiles
eas.build.production.android = { image: "ubuntu-22.04-jdk-17-ndk-r23b" };
if (eas.build['production-equipop']) {
    eas.build['production-equipop'].android = { image: "ubuntu-22.04-jdk-17-ndk-r23b" };
}

fs.writeFileSync(easPath, JSON.stringify(eas, null, 2));

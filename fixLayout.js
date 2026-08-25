const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'ruralpop-mobile/app/_layout.tsx');
let content = fs.readFileSync(file, 'utf8');

// Add import
content = content.replace(
    /import \{ FavoritesProvider \} from "\.\.\/src\/contexts\/FavoritesContext";/,
    `import { FavoritesProvider } from "../src/contexts/FavoritesContext";\nimport { UnreadProvider } from "../src/contexts/UnreadContext";`
);

// Wrap Stack in UnreadProvider
content = content.replace(
    /<FavoritesProvider>/,
    `<FavoritesProvider>\n                        <UnreadProvider>`
);
content = content.replace(
    /<\/FavoritesProvider>/,
    `</UnreadProvider>\n                    </FavoritesProvider>`
);

fs.writeFileSync(file, content);

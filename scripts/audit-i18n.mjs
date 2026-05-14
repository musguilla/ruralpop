import * as fs from 'fs';
import * as http from 'http';

// We run tests against the local dev server. Ensure it's running on port 3000
const BASE_URL = 'http://localhost:3000';

const TEST_URLS = [
  { url: '/pt/tratores-usados', expectedIndexable: true, expectedCanonical: '/pt/tratores-usados' },
  { url: '/pt', expectedIndexable: true, expectedCanonical: '/pt' },
  { url: '/tractores-usados', expectedIndexable: true, expectedCanonical: '/tractores-usados' },
  { url: '/pt/ruta-inventada-no-indexable', expectedIndexable: false, expectedCanonical: '/pt/ruta-inventada-no-indexable' }
];

async function fetchUrl(path) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE_URL}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', err => reject(err));
  });
}

function extractMeta(html) {
  const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="(.*?)"/i);
  const robotsMatch = html.match(/<meta\s+name="robots"\s+content="(.*?)"/i);
  
  const hreflangMatches = [...html.matchAll(/<link\s+rel="alternate"\s+hreflang="(.*?)"\s+href="(.*?)"/ig)];
  const hreflangs = hreflangMatches.reduce((acc, match) => {
    acc[match[1]] = match[2];
    return acc;
  }, {});

  return {
    canonical: canonicalMatch ? canonicalMatch[1].replace('https://www.ruralpop.com', '') : null,
    robots: robotsMatch ? robotsMatch[1] : null,
    hreflangs,
  };
}

async function runAudit() {
  console.log(`\n=== 🚀 Iniciando Auditoría i18n SEO ===\n`);

  let allPassed = true;

  for (const test of TEST_URLS) {
    try {
      const response = await fetchUrl(test.url);
      const meta = extractMeta(response.data);
      
      console.log(`Auditing: ${test.url} (Status: ${response.status})`);
      
      let testPassed = true;
      const isIndexable = !meta.robots || meta.robots.includes('index') && !meta.robots.includes('noindex');

      if (isIndexable !== test.expectedIndexable) {
        console.error(`  ❌ INDEXABLE FAIL: Expected ${test.expectedIndexable}, got ${isIndexable}`);
        testPassed = false;
      }

      if (meta.canonical !== test.expectedCanonical) {
         console.error(`  ❌ CANONICAL FAIL: Expected ${test.expectedCanonical}, got ${meta.canonical}`);
         testPassed = false;
      }

      // Check hreflangs exist
      if (!meta.hreflangs['es-ES'] || !meta.hreflangs['pt-PT']) {
         console.error(`  ❌ HREFLANG FAIL: Missing bidirectional hreflang tags.`);
         testPassed = false;
      }
      
      if (testPassed) {
         console.log(`  ✅ OK: Canonical, Robots y Hreflang correctos.`);
      } else {
         allPassed = false;
      }
      console.log('---');
    } catch (e) {
      console.error(`  ❌ ERROR FETCHING ${test.url}: Is the server running on port 3000?`);
      allPassed = false;
    }
  }
  
  console.log(`\n=== Auditoría finalizada ===`);
  if (allPassed) {
    console.log(`✅ ¡Todo perfecto! La internacionalización cumple con las reglas SEO.`);
    process.exit(0);
  } else {
    console.log(`❌ Se encontraron errores. Revisa el log.`);
    process.exit(1);
  }
}

runAudit();

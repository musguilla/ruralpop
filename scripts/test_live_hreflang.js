async function testHreflang() {
    const urls = [
        'https://www.ruralpop.com/anuncios-toledo',
        'https://www.ruralpop.com/pt/anuncios-toledo'
    ];

    for (const url of urls) {
        console.log(`\n================ Fetching: ${url} ================`);
        try {
            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
                }
            });
            const html = await res.text();

            // Extract all <link rel="alternate" or hreflang tags
            const hreflangRegex = /<link[^>]*hreflang[^>]*>/gi;
            const matches = html.match(hreflangRegex);

            console.log("Status Code:", res.status);
            console.log("Hreflang tags found:");
            if (matches) {
                matches.forEach(m => console.log("  ", m));
            } else {
                console.log("  NONE FOUND!");
            }

            // Extract canonical
            const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*>/i);
            console.log("Canonical tag:", canonicalMatch ? canonicalMatch[0] : "NONE");
        } catch (e) {
            console.error("Fetch error:", e.message);
        }
    }
}

testHreflang();

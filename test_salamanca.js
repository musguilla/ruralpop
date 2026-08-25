const metaUrl = "https://datosabiertossalamanca.es/api/3/action/package_show?id=cotizaciones-semanales-de-la-lonja-de-salamanca";
fetch(metaUrl).then(r => r.json()).then(j => {
    const csvUrl = j.result.resources.find(r => r.format === 'CSV').url;
    fetch(csvUrl).then(r => r.text()).then(t => {
        const lines = t.split('\n');
        let bovinoCount = 0;
        let earliestDate = "9999";
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const parts = line.split(';');
            const clean = parts.map(p => p.replace(/^"|"$/g, ''));
            const fechaStr = clean[1];
            const mesa = clean[2];
            if (mesa && mesa.toUpperCase().includes('BOVINO')) {
                bovinoCount++;
                if (fechaStr < earliestDate) earliestDate = fechaStr;
            }
        }
        console.log("Bovino lines:", bovinoCount, "Earliest:", earliestDate);
    })
})

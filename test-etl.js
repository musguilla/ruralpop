require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const getCSV = async () => {
  const meta = await fetch("https://datosabiertossalamanca.es/api/3/action/package_show?id=cotizaciones-semanales-de-la-lonja-de-salamanca").then(r => r.json());
  const csvRes = meta.result.resources.find(r => r.format === 'CSV');
  const csvText = await fetch(csvRes.url).then(r => r.text());
  
  const lines = csvText.split('\n');
  const bovinoRecords = [];
  
  for (let i = 1; i < lines.length; i++) {
      if (i > 3000) break; 
      const line = lines[i].trim();
      if (!line) continue;
      
      const parts = line.split(';');
      const clean = parts.map(p => p.replace(/^"|"$/g, ''));
      
      const fechaStr = clean[1];
      const mesa = clean[2];
      const producto = clean[3];
      const categoria = clean[4];
      const valor1Str = clean[5];
      
      if (!mesa || !mesa.toUpperCase().includes('BOVINO')) continue;
      
      bovinoRecords.push({ fechaStr, mesa, producto, categoria, valor1Str });
  }
  
  // check 20-07 records
  const newRecords = bovinoRecords.filter(r => r.fechaStr === '2026-07-20');
  console.log('2026-07-20 records:', newRecords.length);
  if (newRecords.length > 0) {
      console.log('Sample record:', newRecords[0]);
  }
};
getCSV();

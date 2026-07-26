const getCSV = async () => {
  const meta = await fetch("https://datosabiertossalamanca.es/api/3/action/package_show?id=cotizaciones-semanales-de-la-lonja-de-salamanca").then(r => r.json());
  const csvRes = meta.result.resources.find(r => r.format === 'CSV');
  console.log(csvRes.url);
};
getCSV();

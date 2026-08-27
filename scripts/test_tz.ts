const options = { timeZone: 'Europe/Madrid', year: 'numeric', month: 'numeric', day: 'numeric' } as const;
const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(new Date());
let year, month, day;
for (const p of parts) {
    if (p.type === 'year') year = p.value;
    if (p.type === 'month') month = p.value;
    if (p.type === 'day') day = p.value;
}
const spainDateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00.000+02:00`; // Wait, +02:00 or +01:00 depending on DST!
console.log(spainDateString);

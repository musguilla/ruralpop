const now = new Date();
const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Madrid',
    year: 'numeric', month: '2-digit', day: '2-digit'
});
const madridDateStr = formatter.format(now);
const guess1 = new Date(`${madridDateStr}T00:00:00+01:00`);
const guess2 = new Date(`${madridDateStr}T00:00:00+02:00`);
const h1 = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Madrid', hour: 'numeric', hour12: false }).format(guess1);
const todayStart = (h1 === '24' || h1 === '0' || h1 === '00') ? guess1 : guess2;
console.log("Madrid date:", madridDateStr);
console.log("h1 (guess1 hour):", h1);
console.log("todayStart UTC:", todayStart.toISOString());

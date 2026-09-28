const today = new Date();
const daysToTest = Array.from({ length: 9 }, (_, i) => i);
daysToTest.forEach(i => {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - i);
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    console.log(`Testing ${year}${month}${day}`);
});

import { calculateRuralpopFee } from "./src/lib/services/escrow.ts";

function runTest(input, expected) {
  const result = calculateRuralpopFee(input);
  if (result === expected) {
    console.log(`✅ Passed: ${input} cents -> ${result} cents`);
  } else {
    console.error(`❌ Failed: ${input} cents. Expected ${expected}, got ${result}`);
    process.exit(1);
  }
}

console.log("Running calculateRuralpopFee tests...");

// - 0 € – 5 € → 0,40 € fijo
runTest(400, 40);

// - 6 € – 10 € → 0,50 € fijo
runTest(800, 50);

// - 11 € – 50 € → 1,50 € fijo
runTest(3000, 150);

// - 51 € – 300 € → 4%
runTest(10000, 400); // 100€ -> 4€

// - 300 € – 1.000 € → 3%
runTest(50000, 1500); // 500€ -> 15€

// - 1.000,01 € a 5.000 € → 2,2%
runTest(200000, 4400); // 2000€ -> 44€

// - Más de 5.000 € → 2%
runTest(600000, 12000); // 6000€ -> 120€

console.log("All tests passed successfully.");

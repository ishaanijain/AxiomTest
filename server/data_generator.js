const fs = require('fs');

// Generate 1000 synthetic placement records
const generateData = () => {
  const records = [];
  
  for (let i = 0; i < 1000; i++) {
    // Generate normally distributed base scores between 100 and 8000
    // Most students score around 1500 - 3000
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    
    let baseScore = Math.floor(2500 + z0 * 1200);
    
    // Clamp values
    if (baseScore < 200) baseScore = Math.floor(Math.random() * 800) + 200;
    if (baseScore > 8500) baseScore = 8500;
    
    // Calculate simulated interview yield (Cycle 1)
    let yieldInterviews = Math.max(0, Math.round(baseScore * 1 * 0.002));
    
    // Add some noise so it's not a perfect linear correlation
    const noise = Math.random() > 0.5 ? 1 : -1;
    if (yieldInterviews > 2 && Math.random() > 0.7) {
        yieldInterviews += noise;
    }

    records.push({
      id: `std_${i}`,
      score: baseScore,
      interviews: yieldInterviews
    });
  }

  // Sort descending by score for easy percentile calculation
  records.sort((a, b) => b.score - a.score);

  fs.writeFileSync('database.json', JSON.stringify(records, null, 2));
  console.log("Successfully generated database.json with 1,000 placement records.");
};

generateData();

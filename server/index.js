const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Load Synthetic Benchmark Database
let db = [];
try {
  const dbPath = path.join(__dirname, 'database.json');
  if (fs.existsSync(dbPath)) {
    db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  }
} catch (e) {
  console.error("Failed to load database.json");
}

// Secure Point Mapping Dictionary
// The frontend only sends string keys (e.g. 'p_gap'). The server translates them here.
const pointMap = {
  // P
  'p_broad': 0, 'p_subfield': 1, 'p_app': 2, 'p_problem': 3, 'p_context': 4, 'p_gap': 5,
  // E
  'e_none': 0, 'e_class': 1, 'e_private': 2, 'e_public': 3, 'e_clean': 4, 'e_high': 5,
  // D
  'd_figuring': 0, 'd_broad': 1, 'd_sub': 2, 'd_prob': 3, 'd_meth': 4, 'd_novel': 5,
  // H
  'h_pi': 1, 'h_manager': 3, 'h_postdoc': 4, 'h_mid': 5,
  // S
  's_general': 1, 's_meth': 3, 's_direct': 5,
  // F
  'f_resume': 1, 'f_artifact': 3, 'f_tailored': 5,
  // D_artifact
  'da_super': 1, 'da_solid': 3, 'da_defend': 5,
  // A
  'a_lock': 0, 'a_setup': 3, 'a_clean': 5,
  // E_warm
  'ew_never': 1, 'ew_recent': 3, 'ew_prime': 5,
  // R
  'r_low': 1, 'r_med': 3, 'r_high': 5,
  // T_warm
  'tw_obs': 1, 'tw_quest': 3, 'tw_analyt': 5,
  // V
  'v_low': 2, 'v_mod': 5, 'v_high': 10, 'v_hyper': 20,
  // S_sub
  'ss_opp': 0, 'ss_name': 2, 'ss_action': 3, 'ss_proof': 4,
  // H_hook
  'hh_int': 0, 'hh_find': 2, 'hh_deep': 3, 'hh_conn': 4, 'hh_intellec': 5,
  // MV
  'mv_gain': 0, 'mv_skill': 2, 'mv_both': 3, 'mv_proj': 4, 'mv_serve': 5,
  // CTA
  'cta_conn': 1, 'cta_meet': 2, 'cta_low': 3,
  // M
  'm_first': 1, 'm_one': 1.5, 'm_multi': 3, 'm_strong': 5
};

const getVal = (key, fallback = 0) => {
  if (key === undefined || key === null) return fallback;
  return pointMap[key] !== undefined ? pointMap[key] : fallback;
};

// The "Black Box" Mathematical Engine
// Housed on the server so no one can read the client-side code and steal the formula.
app.post('/api/calculate', (req, res) => {
  try {
    const { answers, simulatedVolume } = req.body;
    
    // Map string IDs to secure numerical weights
    const P = getVal(answers.P, 0);
    const E = getVal(answers.E, 0);
    const D = getVal(answers.D, 0);
    const H = getVal(answers.H, 0);
    const S = getVal(answers.S, 0);
    const F = getVal(answers.F, 0);
    const D_artifact = getVal(answers.D_artifact, 0);
    const A = getVal(answers.A, 0);
    const E_warm = getVal(answers.E_warm, 0);
    const R = getVal(answers.R, 0);
    const T_warm = getVal(answers.T_warm, 0);
    const V = getVal(answers.V, 0);
    const S_sub = getVal(answers.S_sub, 0);
    const H_hook = getVal(answers.H_hook, 0);
    const MV = getVal(answers.MV, 0);
    const CTA = getVal(answers.CTA, 0);
    const M = getVal(answers.M, 1);
    
    const L = answers.L || [];

    // Component Score Calculations
    const I = P + E + D;
    
    // Vitality Score with Decoy Logic (Red Herrings)
    let vitalityScore = 0;
    L.forEach(item => {
       if (['l_pub', 'l_fund', 'l_grant', 'l_phd', 'l_hire'].includes(item)) vitalityScore += 1;
       if (['l_dean', 'l_huge', 'l_old'].includes(item)) vitalityScore -= 1;
    });
    if (vitalityScore < 0) vitalityScore = 0;
    
    const T = H * vitalityScore * S;
    const C = F * D_artifact * A;
    const W = E_warm + R + T_warm;
    const Q = S_sub + H_hook + MV + CTA;
    
    // Use simulated volume if provided from the slider, otherwise use baseline
    const effectiveVolume = simulatedVolume !== null && simulatedVolume !== undefined ? simulatedVolume : Number(V);

    // Proprietary Master Formula
    const masterScore = ((I * T) + (C * W) + (effectiveVolume * Q)) * Number(M);
    const baseScore = (I * T) + (C * W) + (effectiveVolume * Q);

    // Proprietary Kill Conditions (Critical Flaws)
    const killConditions = [];
    if (I < 9) killConditions.push("Identity Focus lacks specificity. Re-evaluate your core narrative.");
    if (vitalityScore < 2) killConditions.push("Targeted lab vitality is too low to yield viable placements.");
    if (A === 0) killConditions.push("Your artifact requires a login or the link is broken.");
    if (Q < 10) killConditions.push("Outreach communication strategy falls below the quality threshold.");
    if (S_sub === 0) killConditions.push("Your subject line is flagged as generic spam.");
    if (H_hook === 0) killConditions.push("Your email opener is generic. This guarantees rejection.");

    // Projection Generation
    const radarData = [
      { subject: 'Research Focus', score: Math.round((I / 15) * 100), fullMark: 100 },
      { subject: 'Target Alignment', score: Math.round((T / 125) * 100), fullMark: 100 },
      { subject: 'Proof of Work', score: Math.round((C / 125) * 100), fullMark: 100 },
      { subject: 'Network Signal', score: Math.round((W / 15) * 100), fullMark: 100 },
      { subject: 'Outreach Strategy', score: Math.round((Q / 17) * 100), fullMark: 100 }
    ];

    const projectionData = [
      { cycle: 'Cycle 1', interviews: Math.max(0, Math.round(baseScore * 1 * 0.002)) },
      { cycle: 'Cycle 2', interviews: Math.max(0, Math.round(baseScore * 1.5 * 0.002)) },
      { cycle: 'Cycle 3', interviews: Math.max(0, Math.round(baseScore * 3 * 0.002)) },
      { cycle: 'Cycle 4+', interviews: Math.max(0, Math.round(baseScore * 5 * 0.002)) }
    ];

    // Data Engine: Calculate Percentile against the 1,000 record benchmark
    let percentile = 50;
    if (db.length > 0) {
      // Find how many students scored lower than this user
      const lowerScoresCount = db.filter(record => record.score < baseScore).length;
      percentile = Math.round((lowerScoresCount / db.length) * 100);
    }
    
    // Cap at 99% for realism
    if (percentile > 99) percentile = 99;
    if (percentile < 1) percentile = 1;

    res.json({
      masterScore,
      baseScore,
      killConditions,
      radarData,
      projectionData,
      percentile,
      effectiveVolume,
      diagnostics: { I, T, C, W, Q }
    });

  } catch (error) {
    console.error("Calculation Error:", error);
    res.status(500).json({ error: "Failed to process formula parameters." });
  }
});

// Mock Lead Storage Endpoint
app.post('/api/leads', (req, res) => {
  const { email } = req.body;
  // In a real production app, this connects to Supabase/Postgres.
  console.log(`[DATABASE MOCK] Saved Lead: ${email}`);
  res.json({ success: true, message: "Lead captured securely." });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Axiom Black-Box Server running on port ${PORT}`);
});

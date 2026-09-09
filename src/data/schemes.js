// Simulated Maharashtra Industrial Policy data used for the eligibility engine.
// Modeled loosely on the structure of PSI 2019 (Package Scheme of Incentives)
// and CMEGP for demo purposes. Figures are illustrative, not legal advice.

export const DISTRICTS = [
  'Mumbai City',
  'Mumbai Suburban',
  'Thane',
  'Pune',
  'Nashik',
  'Nagpur',
  'Aurangabad (Chh. Sambhajinagar)',
  'Kolhapur',
  'Solapur',
  'Amravati',
  'Gadchiroli',
  'Gondia',
  'Chandrapur',
  'Yavatmal',
  'Osmanabad (Dharashiv)',
  'Ratnagiri',
];

// Talukas are classified by the state into industrial development zones (A/B/C/D/D+/No-Industry)
// which decide the incentive slab. This mock maps whole districts to a representative zone.
export const DISTRICT_ZONE = {
  'Mumbai City': 'A',
  'Mumbai Suburban': 'A',
  Thane: 'A',
  Pune: 'B',
  Nashik: 'B',
  Nagpur: 'C',
  'Aurangabad (Chh. Sambhajinagar)': 'C',
  Kolhapur: 'B',
  Solapur: 'C',
  Amravati: 'D',
  Gadchiroli: 'D+',
  Gondia: 'D+',
  Chandrapur: 'D',
  Yavatmal: 'D',
  'Osmanabad (Dharashiv)': 'D',
  Ratnagiri: 'C',
};

export const ZONE_LABEL = {
  A: 'Zone A · Developed (Mumbai Metropolitan Region)',
  B: 'Zone B · Developing',
  C: 'Zone C · Moderately Developed',
  D: 'Zone D · Less Developed (Vidarbha/Marathwada)',
  'D+': 'Zone D+ · Least Developed / Naxal-affected',
  'No Industry District': 'No Industry District · Highest Incentive Slab',
};

export const INDUSTRY_TYPES = [
  'Textile',
  'Information Technology (IT/ITES)',
  'Automobile & Auto Components',
  'Food Processing / Agro-based',
  'Pharmaceuticals',
  'Electronics & Electrical',
  'Chemicals',
  'General Manufacturing (MSME)',
];

// Zone-wise incentive slabs (illustrative, inspired by PSI 2019 structure).
// Higher backwardness (D / D+) = higher incentive ceiling to draw investment there.
const ZONE_SLABS = {
  A: { capitalSubsidyPct: 20, powerSubsidyPct: 0, stampDutyPct: 50, interestSubsidyPct: 0, ceilingYears: 7 },
  B: { capitalSubsidyPct: 30, powerSubsidyPct: 20, stampDutyPct: 75, interestSubsidyPct: 0, ceilingYears: 7 },
  C: { capitalSubsidyPct: 40, powerSubsidyPct: 30, stampDutyPct: 100, interestSubsidyPct: 3, ceilingYears: 8 },
  D: { capitalSubsidyPct: 50, powerSubsidyPct: 50, stampDutyPct: 100, interestSubsidyPct: 5, ceilingYears: 9 },
  'D+': { capitalSubsidyPct: 65, powerSubsidyPct: 75, stampDutyPct: 100, interestSubsidyPct: 5, ceilingYears: 10 },
};

// Industry-specific multipliers — thrust sectors get a boost, IT gets separate policy treatment.
const INDUSTRY_MODIFIERS = {
  Textile: { capitalBonus: 5, note: 'Eligible under the Integrated & Sustainable Textile Policy top-up.' },
  'Information Technology (IT/ITES)': {
    capitalBonus: 0,
    overridePolicy: 'Maharashtra IT/ITES Policy',
    note: 'IT units are covered under a dedicated IT/ITES policy rather than PSI 2019 industrial slabs.',
  },
  'Automobile & Auto Components': { capitalBonus: 5, note: 'Recognised as a thrust sector for EV & component manufacturing incentives.' },
  'Food Processing / Agro-based': { capitalBonus: 10, note: 'Additional agro-processing cluster incentive applies.' },
  Pharmaceuticals: { capitalBonus: 5, note: 'Eligible for bulk-drug park linked incentives where applicable.' },
  'Electronics & Electrical': { capitalBonus: 5, note: 'Covered under Electronics Manufacturing Cluster incentives.' },
  Chemicals: { capitalBonus: 0, note: 'Standard PSI 2019 slab applies; additional environmental compliance required.' },
  'General Manufacturing (MSME)': { capitalBonus: 0, note: 'Standard MSME slab under PSI 2019 applies.' },
};

function classifyScale(investmentCr) {
  if (investmentCr < 1) return 'Micro';
  if (investmentCr < 10) return 'Small';
  if (investmentCr < 50) return 'Medium';
  return 'Large';
}

/**
 * Core matching engine: given district, industry type and investment size (in ₹ Cr),
 * returns the list of matched schemes with computed benefit percentages.
 * This mirrors what a rules-engine microservice would compute server-side.
 */
export function matchSchemes({ district, industryType, investmentCr }) {
  if (!district || !industryType || !investmentCr || investmentCr <= 0) return [];

  const zone = DISTRICT_ZONE[district] || 'C';
  const slab = ZONE_SLABS[zone];
  const modifier = INDUSTRY_MODIFIERS[industryType] || { capitalBonus: 0, note: '' };
  const scale = classifyScale(investmentCr);

  const results = [];

  // --- Scheme 1: PSI 2019 (Package Scheme of Incentives) — for all non-IT manufacturing ---
  if (!modifier.overridePolicy) {
    const capitalSubsidyPct = Math.min(slab.capitalSubsidyPct + modifier.capitalBonus, 80);
    const estimatedCapitalSubsidyCr = +((investmentCr * capitalSubsidyPct) / 100).toFixed(2);

    results.push({
      id: 'psi-2019',
      name: 'PSI 2019 – Package Scheme of Incentives',
      authority: 'Directorate of Industries, Maharashtra',
      zone,
      zoneLabel: ZONE_LABEL[zone],
      scale,
      benefits: {
        capitalSubsidyPct,
        powerSubsidyPct: slab.powerSubsidyPct,
        stampDutyExemptionPct: slab.stampDutyPct,
        interestSubsidyPct: slab.interestSubsidyPct,
        eligibilityPeriodYears: slab.ceilingYears,
      },
      estimatedCapitalSubsidyCr,
      note: modifier.note,
      matchReason: `Matched based on ${zone} zone classification for ${district} and ${scale.toLowerCase()}-scale ${industryType.toLowerCase()} investment.`,
    });
  }

  // --- Scheme 2: Maharashtra IT/ITES Policy — only for IT industry type ---
  if (modifier.overridePolicy === 'Maharashtra IT/ITES Policy') {
    results.push({
      id: 'it-ites-policy',
      name: 'Maharashtra IT/ITES Policy 2023',
      authority: 'Directorate of Information Technology, Maharashtra',
      zone,
      zoneLabel: ZONE_LABEL[zone],
      scale,
      benefits: {
        capitalSubsidyPct: 15,
        powerSubsidyPct: zone === 'A' ? 0 : 25,
        stampDutyExemptionPct: 100,
        interestSubsidyPct: 0,
        eligibilityPeriodYears: 7,
      },
      estimatedCapitalSubsidyCr: +((investmentCr * 15) / 100).toFixed(2),
      note: modifier.note,
      matchReason: `Matched because ${industryType} is governed by a dedicated state IT policy rather than PSI 2019.`,
    });
  }

  // --- Scheme 3: CMEGP — Chief Minister's Employment Generation Programme (small scale, credit-linked) ---
  if (investmentCr <= 5) {
    const marginMoneySubsidyPct = zone === 'D' || zone === 'D+' ? 35 : 25;
    results.push({
      id: 'cmegp',
      name: "CMEGP – Chief Minister's Employment Generation Programme",
      authority: 'Maharashtra State Khadi & Village Industries Board',
      zone,
      zoneLabel: ZONE_LABEL[zone],
      scale,
      benefits: {
        capitalSubsidyPct: marginMoneySubsidyPct,
        powerSubsidyPct: 0,
        stampDutyExemptionPct: 0,
        interestSubsidyPct: 0,
        eligibilityPeriodYears: 3,
      },
      estimatedCapitalSubsidyCr: +((investmentCr * marginMoneySubsidyPct) / 100).toFixed(2),
      note: 'Credit-linked margin money subsidy for new micro/small enterprises generating local employment.',
      matchReason: `Matched because proposed investment (₹${investmentCr} Cr) is within the ₹5 Cr CMEGP eligibility ceiling.`,
    });
  }

  // --- Scheme 4: Vidarbha & Marathwada Special Package (regional equity scheme) ---
  const backwardDistricts = ['Gadchiroli', 'Gondia', 'Chandrapur', 'Yavatmal', 'Amravati', 'Osmanabad (Dharashiv)'];
  if (backwardDistricts.includes(district)) {
    results.push({
      id: 'vidarbha-marathwada-special',
      name: 'Vidarbha & Marathwada Accelerated Industrial Development Package',
      authority: 'Government of Maharashtra – Regional Development Board',
      zone,
      zoneLabel: ZONE_LABEL[zone],
      scale,
      benefits: {
        capitalSubsidyPct: 10,
        powerSubsidyPct: 15,
        stampDutyExemptionPct: 0,
        interestSubsidyPct: 2,
        eligibilityPeriodYears: 10,
      },
      estimatedCapitalSubsidyCr: +((investmentCr * 10) / 100).toFixed(2),
      note: 'Additional regional-equity top-up stacked on top of PSI 2019 for identified backward districts.',
      matchReason: `Matched because ${district} falls under the notified regional backwardness package.`,
    });
  }

  return results;
}

export function totalEstimatedBenefit(matchedSchemes) {
  return +matchedSchemes.reduce((sum, s) => sum + s.estimatedCapitalSubsidyCr, 0).toFixed(2);
}

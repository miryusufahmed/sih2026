// Server-side mirror of src/data/schemes.js. In a real deployment this file
// (not the frontend copy) is the single source of truth — the React app would
// call POST /api/schemes/match instead of importing this logic directly.

const DISTRICT_ZONE = {
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

const ZONE_SLABS = {
  A: { capitalSubsidyPct: 20, powerSubsidyPct: 0, stampDutyPct: 50, interestSubsidyPct: 0, ceilingYears: 7 },
  B: { capitalSubsidyPct: 30, powerSubsidyPct: 20, stampDutyPct: 75, interestSubsidyPct: 0, ceilingYears: 7 },
  C: { capitalSubsidyPct: 40, powerSubsidyPct: 30, stampDutyPct: 100, interestSubsidyPct: 3, ceilingYears: 8 },
  D: { capitalSubsidyPct: 50, powerSubsidyPct: 50, stampDutyPct: 100, interestSubsidyPct: 5, ceilingYears: 9 },
  'D+': { capitalSubsidyPct: 65, powerSubsidyPct: 75, stampDutyPct: 100, interestSubsidyPct: 5, ceilingYears: 10 },
};

const IT_INDUSTRY = 'Information Technology (IT/ITES)';
const BACKWARD_DISTRICTS = ['Gadchiroli', 'Gondia', 'Chandrapur', 'Yavatmal', 'Amravati', 'Osmanabad (Dharashiv)'];

function classifyScale(investmentCr) {
  if (investmentCr < 1) return 'Micro';
  if (investmentCr < 10) return 'Small';
  if (investmentCr < 50) return 'Medium';
  return 'Large';
}

export function matchSchemes({ district, industryType, investmentCr }) {
  if (!district || !industryType || !investmentCr || investmentCr <= 0) return [];

  const zone = DISTRICT_ZONE[district] || 'C';
  const slab = ZONE_SLABS[zone];
  const scale = classifyScale(investmentCr);
  const results = [];

  if (industryType !== IT_INDUSTRY) {
    const capitalSubsidyPct = Math.min(slab.capitalSubsidyPct, 80);
    results.push({
      id: 'psi-2019',
      name: 'PSI 2019 – Package Scheme of Incentives',
      zone,
      scale,
      benefits: {
        capitalSubsidyPct,
        powerSubsidyPct: slab.powerSubsidyPct,
        stampDutyExemptionPct: slab.stampDutyPct,
        interestSubsidyPct: slab.interestSubsidyPct,
        eligibilityPeriodYears: slab.ceilingYears,
      },
      estimatedCapitalSubsidyCr: +((investmentCr * capitalSubsidyPct) / 100).toFixed(2),
    });
  } else {
    results.push({
      id: 'it-ites-policy',
      name: 'Maharashtra IT/ITES Policy 2023',
      zone,
      scale,
      benefits: {
        capitalSubsidyPct: 15,
        powerSubsidyPct: zone === 'A' ? 0 : 25,
        stampDutyExemptionPct: 100,
        interestSubsidyPct: 0,
        eligibilityPeriodYears: 7,
      },
      estimatedCapitalSubsidyCr: +((investmentCr * 15) / 100).toFixed(2),
    });
  }

  if (investmentCr <= 5) {
    const marginMoneySubsidyPct = zone === 'D' || zone === 'D+' ? 35 : 25;
    results.push({
      id: 'cmegp',
      name: "CMEGP – Chief Minister's Employment Generation Programme",
      zone,
      scale,
      benefits: {
        capitalSubsidyPct: marginMoneySubsidyPct,
        powerSubsidyPct: 0,
        stampDutyExemptionPct: 0,
        interestSubsidyPct: 0,
        eligibilityPeriodYears: 3,
      },
      estimatedCapitalSubsidyCr: +((investmentCr * marginMoneySubsidyPct) / 100).toFixed(2),
    });
  }

  if (BACKWARD_DISTRICTS.includes(district)) {
    results.push({
      id: 'vidarbha-marathwada-special',
      name: 'Vidarbha & Marathwada Accelerated Industrial Development Package',
      zone,
      scale,
      benefits: {
        capitalSubsidyPct: 10,
        powerSubsidyPct: 15,
        stampDutyExemptionPct: 0,
        interestSubsidyPct: 2,
        eligibilityPeriodYears: 10,
      },
      estimatedCapitalSubsidyCr: +((investmentCr * 10) / 100).toFixed(2),
    });
  }

  return results;
}

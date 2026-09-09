import { Router } from 'express';
import { matchSchemes } from '../services/schemeEngine.js';
import { getSchemes } from '../data/store.js';

const router = Router();

// GET /api/schemes — Returns comprehensive rich list of Maharashtra government schemes
router.get('/', (req, res) => {
  const { sector, category, district, search } = req.query;
  let results = getSchemes();

  if (category) {
    results = results.filter((s) => s.category.toLowerCase().includes(category.toLowerCase()));
  }

  if (sector) {
    results = results.filter((s) =>
      s.eligibility.sectors.some((sec) => sec.toLowerCase().includes(sector.toLowerCase()))
    );
  }

  if (district) {
    results = results.filter((s) => {
      if (!s.eligibility.districts) return true; // Available statewide unless restricted
      return s.eligibility.districts.some((d) => d.toLowerCase().includes(district.toLowerCase()));
    });
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.shortName.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.overview.toLowerCase().includes(q)
    );
  }

  res.json(results);
});

// GET /api/schemes/all — Alias explicitly returning rich object with count
router.get('/all', (_req, res) => {
  const schemes = getSchemes();
  res.json({
    total: schemes.length,
    schemes: schemes,
  });
});

// GET /api/schemes/:id — Returns single scheme details
router.get('/:id', (req, res) => {
  const scheme = getSchemes().find((s) => s.id === req.params.id);
  if (!scheme) {
    return res.status(404).json({ error: `Scheme '${req.params.id}' not found` });
  }
  res.json(scheme);
});

// POST /api/schemes/match — Rules engine for entrepreneur subsidy calculator
router.post('/match', (req, res) => {
  const { district, industryType, investmentCr } = req.body;
  if (!district || !industryType || !investmentCr) {
    return res.status(400).json({ error: 'district, industryType and investmentCr are required' });
  }
  const matched = matchSchemes({ district, industryType, investmentCr: Number(investmentCr) });
  const totalEstimatedBenefitCr = +matched.reduce((sum, s) => sum + s.estimatedCapitalSubsidyCr, 0).toFixed(2);
  res.json({ matched, totalEstimatedBenefitCr });
});

export default router;

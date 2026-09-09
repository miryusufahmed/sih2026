import React, { useMemo, useState } from 'react';
import { Landmark, Zap, FileSignature, HandCoins, Percent, Sparkle, MapPin } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, Label, Select, Input, Badge } from '@/components/ui';
import Button from '@/components/ui/Button';
import { DISTRICTS, INDUSTRY_TYPES, DISTRICT_ZONE, ZONE_LABEL, matchSchemes, totalEstimatedBenefit } from '@/data/schemes';

function BenefitStat({ icon: Icon, label, value }) {
  if (value === undefined || value === null) return null;
  return (
    <div className="flex items-center gap-2.5 rounded-lg bg-slate-50 px-3 py-2.5">
      <Icon size={16} className="shrink-0 text-governance-600" />
      <div>
        <p className="text-sm font-bold text-slate-800">{value}</p>
        <p className="text-[11px] text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export default function SubsidyMatcher() {
  const { t } = useApp();
  const [district, setDistrict] = useState(DISTRICTS[0]);
  const [industryType, setIndustryType] = useState(INDUSTRY_TYPES[0]);
  const [investmentCr, setInvestmentCr] = useState(10);
  const [hasSearched, setHasSearched] = useState(false);

  const zone = DISTRICT_ZONE[district];

  const matched = useMemo(
    () => (hasSearched ? matchSchemes({ district, industryType, investmentCr: Number(investmentCr) }) : []),
    [hasSearched, district, industryType, investmentCr]
  );

  const totalBenefit = useMemo(() => totalEstimatedBenefit(matched), [matched]);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t.subsidy.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.subsidy.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1 h-fit">
          <CardContent className="space-y-5 pt-5">
            <div>
              <Label>{t.subsidy.district}</Label>
              <Select value={district} onChange={(e) => setDistrict(e.target.value)}>
                {DISTRICTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </Select>
              <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
                <MapPin size={12} /> {ZONE_LABEL[zone]}
              </p>
            </div>

            <div>
              <Label>{t.subsidy.industryType}</Label>
              <Select value={industryType} onChange={(e) => setIndustryType(e.target.value)}>
                {INDUSTRY_TYPES.map((i) => (
                  <option key={i}>{i}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label>{t.subsidy.investment}</Label>
              <Input
                type="number"
                min="0.1"
                step="0.1"
                value={investmentCr}
                onChange={(e) => setInvestmentCr(e.target.value)}
              />
            </div>

            <Button className="w-full" variant="saffron" onClick={() => setHasSearched(true)}>
              <Sparkle size={16} /> {t.subsidy.calculate}
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">{t.subsidy.results}</h3>
            {hasSearched && matched.length > 0 && (
              <Badge variant="saffron">
                {t.subsidy.totalBenefit}: ₹{totalBenefit} {t.common.crores}
              </Badge>
            )}
          </div>

          {!hasSearched && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <Landmark size={32} className="text-slate-300" />
                <p className="text-sm text-slate-400">{t.subsidy.noResults}</p>
              </CardContent>
            </Card>
          )}

          {hasSearched && matched.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-sm text-slate-400">{t.subsidy.noResults}</CardContent>
            </Card>
          )}

          {matched.map((scheme) => (
            <Card key={scheme.id} className="border-l-4 border-l-governance-700">
              <CardContent className="pt-5">
                <div className="mb-1 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{scheme.name}</p>
                    <p className="text-xs text-slate-500">{scheme.authority}</p>
                  </div>
                  <Badge variant="info">{scheme.zoneLabel.split('·')[0].trim()}</Badge>
                </div>

                <p className="mb-4 mt-2 text-xs text-slate-500">{scheme.matchReason}</p>

                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  <BenefitStat icon={HandCoins} label={t.subsidy.capitalSubsidy} value={`${scheme.benefits.capitalSubsidyPct}%`} />
                  <BenefitStat icon={Zap} label={t.subsidy.powerSubsidy} value={`${scheme.benefits.powerSubsidyPct}%`} />
                  <BenefitStat icon={FileSignature} label={t.subsidy.stampDuty} value={`${scheme.benefits.stampDutyExemptionPct}%`} />
                  <BenefitStat icon={Percent} label={t.subsidy.interestSubsidy} value={scheme.benefits.interestSubsidyPct ? `${scheme.benefits.interestSubsidyPct}%` : '—'} />
                </div>

                <div className="mt-4 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2.5 ring-1 ring-emerald-200">
                  <span className="text-xs font-medium text-emerald-800">
                    {t.subsidy.eligible} ₹{scheme.estimatedCapitalSubsidyCr} {t.common.crores} · {scheme.benefits.eligibilityPeriodYears} yrs
                  </span>
                </div>

                {scheme.note && <p className="mt-2 text-[11px] italic text-slate-400">{scheme.note}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

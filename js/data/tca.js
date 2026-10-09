// Single source of truth for the TCA cycle (shared by the 3D wheel, captions and tables).
export const INTERMEDIATES = [
  { n: 'Oxaloacetate', short: 'OAA', c: 4 },
  { n: 'Citrate', c: 6 },
  { n: 'Isocitrate', c: 6 },
  { n: 'α-Ketoglutarate', short: 'α-KG', c: 5 },
  { n: 'Succinyl CoA', c: 4 },
  { n: 'Succinate', c: 4 },
  { n: 'Fumarate', c: 4 },
  { n: 'Malate', c: 4 },
];

// step i converts INTERMEDIATES[i-1] → INTERMEDIATES[i % 8]
export const STEPS = [
  null,
  { e: 'Citrate synthase', short: 'Citrate synthase', type: 'Condensation', sub: 'Oxaloacetate + acetyl CoA', prod: 'Citrate', cn: '4C + 2C → 6C', out: [], tip: 'cs', reg: true },
  { e: 'Aconitase', short: 'Aconitase', type: 'Isomerization', sub: 'Citrate', prod: 'Isocitrate', cn: '6C → 6C', out: [], tip: 'aco' },
  { e: 'Isocitrate dehydrogenase', short: 'Isocitrate DH', type: 'Oxidative decarboxylation', sub: 'Isocitrate', prod: 'α-Ketoglutarate', cn: '6C → 5C', out: ['nadh', 'co2'], tip: 'idh', reg: true },
  { e: 'α-Ketoglutarate dehydrogenase complex', short: 'α-KG DH complex', type: 'Oxidative decarboxylation', sub: 'α-Ketoglutarate', prod: 'Succinyl CoA', cn: '5C → 4C', out: ['nadh', 'co2'], tip: 'akgdh', reg: true },
  { e: 'Succinate thiokinase', short: 'Succinate thiokinase', type: 'Substrate-level phosphorylation', sub: 'Succinyl CoA', prod: 'Succinate', cn: '4C → 4C', out: ['gtp'], tip: 'scs' },
  { e: 'Succinate dehydrogenase', short: 'Succinate DH', type: 'Oxidation (dehydrogenation)', sub: 'Succinate', prod: 'Fumarate', cn: '4C → 4C', out: ['fadh'], tip: 'sdh' },
  { e: 'Fumarase', short: 'Fumarase', type: 'Hydration', sub: 'Fumarate', prod: 'Malate', cn: '4C → 4C', out: [], in: ['h2o'], tip: 'fum' },
  { e: 'Malate dehydrogenase', short: 'Malate DH', type: 'Oxidation', sub: 'Malate', prod: 'Oxaloacetate', cn: '4C → 4C', out: ['nadh'], tip: 'mdh' },
];

export const PRODUCTS = {
  nadh: { label: 'NADH', color: '#30d158' },
  fadh: { label: 'FADH₂', color: '#ff6fae' },
  gtp: { label: 'GTP', color: '#ff9f0a' },
  co2: { label: 'CO₂', color: '#6aa8ff' },
};

// running totals after step s
export function tally(s) {
  const t = { nadh: 0, fadh: 0, gtp: 0, co2: 0 };
  for (let i = 1; i <= Math.min(s, 8); i++) STEPS[i].out.forEach(o => t[o]++);
  return t;
}

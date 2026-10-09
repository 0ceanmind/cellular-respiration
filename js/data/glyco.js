// Glycolysis in the lecture's 7-step scheme (L.11). The full pathway has 10 reactions; the lecture folds
// phosphoglucose isomerase, triose phosphate isomerase and phosphoglycerate mutase into neighbouring steps.
export const GSTEPS = [
  null,
  { e: 'Hexokinase / glucokinase', short: 'Hexokinase · glucokinase', type: 'Phosphorylation', what: 'Glucose → glucose 6-phosphate', atp: -1, ctrl: true, tip: 'g1' },
  { e: 'Phosphofructokinase-1', short: 'PFK-1', type: 'Phosphorylation', what: 'Fructose 6-P → fructose 1,6-bisphosphate', atp: -1, ctrl: true, tip: 'g2' },
  { e: 'Aldolase', short: 'Aldolase', type: 'Splitting', what: '6C → two 3C triose phosphates', tip: 'g3' },
  { e: 'Glyceraldehyde 3-P dehydrogenase', short: 'G3P dehydrogenase', type: 'Oxidation', what: '+ NAD⁺ + Pᵢ → 1,3-bisphosphoglycerate + NADH', nadh: 2, poison: 'Arsenate', tip: 'g4' },
  { e: 'Phosphoglycerate kinase', short: 'Phosphoglycerate kinase', type: 'Dephosphorylation · SLP', what: '1,3-BPG → 3-phosphoglycerate + ATP', atp: 2, tip: 'g5' },
  { e: 'Enolase', short: 'Enolase', type: 'Dehydration', what: '2-Phosphoglycerate → PEP + H₂O', poison: 'Fluoride', tip: 'g6' },
  { e: 'Pyruvate kinase', short: 'Pyruvate kinase', type: 'Dephosphorylation · SLP', what: 'Phosphoenolpyruvate → pyruvate + ATP', atp: 2, ctrl: true, tip: 'g7' },
];

export function gtally(s) {
  const used = Math.min(s, 2);
  const made = (s >= 5 ? 2 : 0) + (s >= 7 ? 2 : 0);
  return { used, made, nadh: s >= 4 ? 2 : 0, net: made - used };
}

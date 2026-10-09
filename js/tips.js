// Hover-card content. Everything that is "more detail" lives here, not on the slides.
// k = kicker, t = title, c = accent colour, b = bullet lines, rows = key/value pairs, n = footnote.

const G = '#30d158', O = '#ff9f0a', V = '#7d7aff', R = '#ff453a', B = '#5ac8fa', P = '#ff6fae', Y = '#ffd60a';

export const TIPS = {
  /* ── learning outcomes ───────────────────────── */
  'obj-1': { k: 'L.12 · Learning outcomes', t: 'The Bridge — PDH complex', c: G, b: [
    'L.12.1 Role, reactants, products, location &amp; tissue distribution of PDH',
    'L.12.2 Compare PDH with α-KG DH &amp; branched-chain α-keto acid DH',
    'L.12.3 Severe thiamine deficiency — link symptoms to biochemistry',
    'L.12.4 Why give thiamine with glucose in suspected hypoglycemia'] },
  'obj-2': { k: 'L.13 · Learning outcomes', t: 'The Cycle — TCA', c: O, b: [
    'L.13.1 Steps, energetics &amp; regulation of the TCA cycle',
    'L.13.2 Central link: glycolysis, gluconeogenesis, OxPhos, fatty acid &amp; amino acid metabolism',
    'L.13.3 Intermediates as sources for biosynthesis'] },
  'obj-3': { k: 'L.10 · Learning outcomes', t: 'The Power Plant — ETC', c: V, b: [
    'L.10.1 Define oxidative phosphorylation',
    'L.10.2 List the components of the ETC',
    'L.10.3 Explain the mechanism of cellular respiration',
    'L.10.4 Inhibitors &amp; uncouplers of the ETC'] },

  /* ── PDH complex ─────────────────────────────── */
  E1: { k: 'Enzyme 1', t: 'Pyruvate decarboxylase', c: '#ff6482', rows: [['Coenzyme', 'TPP (thiamine pyrophosphate)'], ['Job', 'Removes CO<sub>2</sub> from pyruvate'], ['Vitamin', 'B<sub>1</sub> · thiamine']], n: 'Also called pyruvate dehydrogenase (E1). It is the TPP-dependent step — the one thiamine deficiency hits.' },
  E2: { k: 'Enzyme 2', t: 'Dihydrolipoyl transacetylase', c: '#bf8cff', rows: [['Coenzymes', 'Lipoic acid · CoA'], ['Job', 'Hands the acetyl group to CoA'], ['Product', 'Acetyl CoA']], n: 'Forms the structural core of the complex. Its lipoyl "swinging arm" carries the intermediate between active sites.' },
  E3: { k: 'Enzyme 3', t: 'Dihydrolipoyl dehydrogenase', c: '#5ac8fa', rows: [['Coenzymes', 'FAD · NAD<sup>+</sup>'], ['Job', 'Re-oxidizes lipoic acid'], ['Product', 'NADH']], n: 'The same E3 is shared with the α-ketoglutarate and branched-chain α-keto acid dehydrogenase complexes.' },
  'pdh-core': { k: 'Schematic', t: 'Inner core = E2', c: '#bf8cff', b: ['E2 subunits form the central scaffold', 'E1 and E3 bind around it', 'Substrate never leaves the complex — fast, efficient channelling'] },

  tpp: { k: 'T · E1', t: 'Thiamine pyrophosphate', c: '#ff6482', rows: [['Vitamin', 'B<sub>1</sub> (thiamine)'], ['Used by', 'E1 — decarboxylation']], n: 'Deficiency → PDH &amp; α-KG DH fail → beriberi, Wernicke–Korsakoff.' },
  lipoic: { k: 'L · E2', t: 'Lipoic acid', c: '#bf8cff', rows: [['Vitamin', 'Not a vitamin — made in the body'], ['Used by', 'E2 — carries the acetyl group']], n: 'Arsenite poisoning binds lipoic acid → blocks PDH and α-KG DH.' },
  coa: { k: 'C · E2', t: 'Coenzyme A', c: '#bf8cff', rows: [['Vitamin', 'B<sub>5</sub> (pantothenic acid)'], ['Used by', 'E2 — accepts the acetyl group']] },
  fad: { k: 'F · E3', t: 'FAD', c: '#5ac8fa', rows: [['Vitamin', 'B<sub>2</sub> (riboflavin)'], ['Used by', 'E3 — accepts electrons first']] },
  nad: { k: 'N · E3', t: 'NAD<sup>+</sup>', c: '#5ac8fa', rows: [['Vitamin', 'B<sub>3</sub> (niacin)'], ['Used by', 'E3 — final electron acceptor → NADH']] },
  pyruvate: { k: 'Substrate', t: 'Pyruvate', c: '#30d158', rows: [['Carbons', '3'], ['From', 'Glycolysis (cytosol)']] },
  acetylcoa: { k: 'Product', t: 'Acetyl CoA', c: '#64d2ff', rows: [['Carbons', '2 (acetyl group)'], ['Goes to', 'TCA cycle — the entry point']] },
  'pdh-irrev': { k: 'Key fact', t: 'A one-way bridge', c: G, b: ['Pyruvate → acetyl CoA is irreversible', 'So acetyl CoA cannot be turned back into glucose'] },

  /* ── where ──────────────────────────────────── */
  matrixLoc: { k: 'Cell level', t: 'Mitochondrial matrix', c: B, b: ['Glycolysis happens in the cytosol', 'Pyruvate is carried into the matrix', 'PDH and the TCA enzymes work there'] },
  brain: { k: 'High demand', t: 'Brain', c: '#bf8cff', b: ['Depends almost entirely on glucose oxidation', 'PDH defects → neurological signs'] },
  heart: { k: 'High demand', t: 'Heart', c: '#ff6482', b: ['Continuous, intense ATP demand', 'Thiamine deficiency → wet beriberi'] },
  kidney: { k: 'High demand', t: 'Kidney', c: '#ff9f0a', b: ['Energy-hungry active transport', 'Rich in mitochondria and PDH'] },
  rbc: { k: 'The exception', t: 'Red blood cells', c: R, b: ['No mitochondria → no PDH, no TCA', 'Make ATP by glycolysis only, ending in lactate'] },

  /* ── analogues ──────────────────────────────── */
  'an-pdh': { k: 'Bridge', t: 'PDH complex', c: G, rows: [['Reaction', 'Pyruvate → acetyl CoA'], ['Regulation', 'Covalent: PDH kinase (off) · PDH phosphatase (on)'], ['Kinase ↑ by', 'ATP · acetyl CoA · NADH'], ['Kinase ↓ by', 'Pyruvate']], n: 'Ca<sup>2+</sup> activates the phosphatase → PDH switched on.' },
  'an-akgdh': { k: 'TCA step 4', t: 'α-Ketoglutarate DH complex', c: O, rows: [['Reaction', 'α-KG → succinyl CoA'], ['Releases', 'CO<sub>2</sub> + NADH'], ['Regulation', 'Not by phosphorylation — allosteric'], ['↓ / ↑', 'NADH, succinyl CoA ↓ · Ca<sup>2+</sup> ↑']], n: 'Structurally and mechanistically the twin of PDH.' },
  'an-bckdh': { k: 'Amino acid catabolism', t: 'Branched-chain α-keto acid DH', c: '#bf8cff', rows: [['Substrates', 'From leucine, isoleucine, valine'], ['Deficiency', 'Maple syrup urine disease']] },
  'an-idh': { k: 'TCA step 3', t: 'Isocitrate dehydrogenase', c: B, rows: [['Structure', 'A single enzyme — not a complex'], ['Coenzyme', 'NAD<sup>+</sup> / NADP<sup>+</sup> — no TPP']], n: 'The mitochondrial TCA isoform uses NAD<sup>+</sup>.' },

  /* ── PDH deficiency ─────────────────────────── */
  lactic: { k: 'Why acidosis?', t: 'Pyruvate has nowhere to go', c: R, b: ['PDH blocked → pyruvate piles up', 'Lactate dehydrogenase converts it to lactate', 'Lactate accumulates → lactic acidosis'] },
  neuro: { k: 'Brain energy failure', t: 'Neurological signs', c: '#bf8cff', b: ['Developmental delay', 'Hypotonia', 'Poor coordination', 'Seizures'] },
  ldh: { k: 'Overflow route', t: 'Lactate dehydrogenase', c: R, rows: [['Reaction', 'Pyruvate ⇌ lactate'], ['Result', '↑ Blood lactate']] },
  altx: { k: 'Overflow route', t: 'Alanine transaminase (ALT)', c: P, rows: [['Reaction', 'Pyruvate ⇌ alanine'], ['Result', '↑ Blood alanine']] },
  pdhgate: { k: 'The blocked bridge', t: 'PDH complex', c: G, b: ['Normal: pyruvate → acetyl CoA → TCA', 'Deficient: the gate closes'] },

  /* ── thiamine ───────────────────────────────── */
  'tpp-hit': { k: 'TPP-dependent', t: 'Who stalls without B<sub>1</sub>?', c: '#ff6482', b: ['PDH complex — the bridge', 'α-KG DH complex — inside the TCA cycle', 'Branched-chain α-keto acid DH'], n: 'Isocitrate dehydrogenase does not need TPP.' },
  wet: { k: 'Heart', t: 'Wet beriberi', c: '#ff6482', b: ['Congestive heart failure', 'High-output failure with edema'] },
  wk: { k: 'Brain', t: 'Wernicke–Korsakoff syndrome', c: '#bf8cff', b: ['Wernicke: confusion, ataxia, ophthalmoplegia', 'Korsakoff: memory loss, confabulation', 'Classic in chronic alcoholism'], n: 'Lecture groups the neurological picture as "dry" beriberi; peripheral neuropathy is the classic dry form.' },

  /* ── TCA ────────────────────────────────────── */
  citrate: { k: 'C<sub>6</sub>H<sub>5</sub>O<sub>7</sub><sup>3−</sup>', t: 'Citrate', c: Y, b: ['First product of the cycle', '3 carboxyl groups → "tri-carboxylic acid" cycle'], n: 'Hans Krebs described the cycle in 1937 · Nobel Prize 1953, shared with Fritz Lipmann (discoverer of coenzyme A).' },
  carboxyl: { k: 'Functional group', t: 'Carboxylate (–COO<sup>−</sup>)', c: '#ff5a4e', b: ['Citrate carries three of them', 'They give the TCA cycle its name'] },
  hydroxyl: { k: 'Functional group', t: 'Hydroxyl (–OH)', c: '#f2f2f7', b: ['Aconitase moves this group', 'Citrate → isocitrate (isomerization)'] },
  amphibolic: { k: 'Dual function', t: 'Amphibolic', c: O, b: ['Catabolic: oxidizes fuel to CO<sub>2</sub>', 'Anabolic: supplies building blocks', 'Glucose, lipids, amino acids, heme'] },
  carbs: { k: 'Fuel', t: 'Carbohydrates', c: G, b: ['Glucose → pyruvate → acetyl CoA'] },
  fats: { k: 'Fuel', t: 'Fats', c: Y, b: ['Fatty acids → β-oxidation → acetyl CoA'] },
  proteins: { k: 'Fuel', t: 'Proteins', c: P, b: ['Amino acids → acetyl CoA or TCA intermediates'] },

  cs: { k: 'Step 1 · condensation', t: 'Citrate synthase', c: R, rows: [['Reaction', 'OAA + acetyl CoA → citrate'], ['Carbons', '4 + 2 → 6']], n: 'Control point — inhibited by ATP, NADH, succinyl CoA &amp; citrate; activated by ADP.' },
  aco: { k: 'Step 2 · isomerization', t: 'Aconitase', c: Y, rows: [['Reaction', 'Citrate → isocitrate'], ['Carbons', '6 → 6']], n: 'Inhibited by fluoroacetate (via fluorocitrate) — a classic poison.' },
  idh: { k: 'Step 3 · oxidative decarboxylation', t: 'Isocitrate dehydrogenase', c: R, rows: [['Reaction', 'Isocitrate → α-ketoglutarate'], ['Releases', 'NADH + CO<sub>2</sub>'], ['Carbons', '6 → 5']], n: 'A key rate-limiting, regulated step. Inhibited by ATP &amp; NADH; activated by ADP &amp; Ca<sup>2+</sup>.' },
  akgdh: { k: 'Step 4 · oxidative decarboxylation', t: 'α-Ketoglutarate DH complex', c: R, rows: [['Reaction', 'α-KG → succinyl CoA'], ['Releases', 'NADH + CO<sub>2</sub>'], ['Carbons', '5 → 4']], n: 'PDH-like: same 3 enzymes &amp; 5 coenzymes. Inhibited by NADH, ATP, succinyl CoA; activated by Ca<sup>2+</sup>.' },
  scs: { k: 'Step 5 · substrate-level phosphorylation', t: 'Succinate thiokinase', c: O, rows: [['Reaction', 'Succinyl CoA → succinate'], ['Makes', 'GTP'], ['Carbons', '4 → 4']], n: 'Also called succinyl CoA synthetase. The only step that makes a high-energy phosphate directly.' },
  sdh: { k: 'Step 6 · oxidation', t: 'Succinate dehydrogenase', c: P, rows: [['Reaction', 'Succinate → fumarate'], ['Makes', 'FADH<sub>2</sub>'], ['Carbons', '4 → 4']], n: 'Embedded in the inner membrane — it is Complex II of the ETC.' },
  fum: { k: 'Step 7 · hydration', t: 'Fumarase', c: B, rows: [['Reaction', 'Fumarate + H<sub>2</sub>O → malate'], ['Carbons', '4 → 4']] },
  mdh: { k: 'Step 8 · oxidation', t: 'Malate dehydrogenase', c: G, rows: [['Reaction', 'Malate → oxaloacetate'], ['Makes', 'NADH'], ['Carbons', '4 → 4']], n: 'Regenerates oxaloacetate, so the cycle can turn again.' },
  'co2-origin': { k: 'Subtle but true', t: 'Which carbons leave?', c: '#6aa8ff', b: ['The 2 CO<sub>2</sub> of one turn come from oxaloacetate', 'The 2 acetyl carbons stay — they leave in later turns'] },

  /* ── regulation ─────────────────────────────── */
  'reg-cs': { k: 'Control point 1', t: 'Citrate synthase', c: R, rows: [['Inhibited by', 'ATP · NADH · succinyl CoA · citrate'], ['Activated by', 'ADP']] },
  'reg-idh': { k: 'Control point 2 · key rate-limiting step', t: 'Isocitrate dehydrogenase', c: R, rows: [['Inhibited by', 'NADH · ATP'], ['Activated by', 'Ca<sup>2+</sup> · ADP']] },
  'reg-akg': { k: 'Control point 3', t: 'α-KG dehydrogenase complex', c: R, rows: [['Inhibited by', 'NADH · ATP · succinyl CoA'], ['Activated by', 'Ca<sup>2+</sup>']] },
  'reg-logic': { k: 'The logic', t: 'Energy charge sets the pace', c: O, b: ['Plenty of ATP / NADH → slow down', 'ADP rising → speed up', 'Ca<sup>2+</sup> (muscle contraction) → speed up'] },

  /* ── amphibolic ─────────────────────────────── */
  pc: { k: '1 · Anaplerotic', t: 'Pyruvate carboxylase', c: G, rows: [['Reaction', 'Pyruvate → oxaloacetate'], ['Needs', 'Biotin · activated by acetyl CoA']], n: 'Refills oxaloacetate — the most important anaplerotic reaction.' },
  me: { k: '2 · Anaplerotic', t: 'Malic enzyme', c: G, rows: [['Reaction', 'Pyruvate ⇌ malate'], ['Cofactor', 'NADP(H)']] },
  ast: { k: '3 · Transamination', t: 'Aspartate transaminase (AST)', c: G, rows: [['Reaction', 'Oxaloacetate ⇌ aspartate'], ['Feeds', 'Protein synthesis']] },
  gdh: { k: '4 · Anaplerotic', t: 'Glutamate dehydrogenase', c: G, rows: [['Reaction', 'α-Ketoglutarate ⇌ glutamate'], ['Feeds', 'Protein synthesis']] },
  alt: { k: '5 · Transamination', t: 'Alanine transaminase (ALT)', c: G, rows: [['Reaction', 'Pyruvate ⇌ alanine']] },
  'out-lipid': { k: 'Building block', t: 'Citrate → fatty acids', c: Y, b: ['Citrate leaves the mitochondrion', 'Cleaved to acetyl CoA in the cytosol', 'Feeds fatty acid synthesis'] },
  'out-gng': { k: 'Building block', t: 'Oxaloacetate → glucose', c: G, b: ['Oxaloacetate is the starting point of gluconeogenesis'] },
  'out-heme': { k: 'Building block', t: 'Succinyl CoA → heme', c: R, b: ['Succinyl CoA + glycine → δ-aminolevulinic acid', 'First step of heme synthesis'] },
  'in-propionyl': { k: 'Refill', t: 'Propionyl CoA → succinyl CoA', c: '#bf8cff', b: ['From odd-chain fatty acids', 'and some amino acids (Val, Ile, Met, Thr)'] },
  'out-acetyl': { k: 'Building block', t: 'Acetyl CoA → lipids', c: Y, b: ['Fatty acids, cholesterol, ketone bodies'] },
  'out-etc': { k: 'Main output', t: 'NADH &amp; FADH<sub>2</sub> → ETC', c: V, b: ['Electrons go to the respiratory chain', 'That is where most ATP is made'] },

  /* ── OxPhos vocabulary ──────────────────────── */
  'def-phos': { k: 'Definition', t: 'Phosphorylation', c: Y, b: ['Formation of ATP from ADP + P<sub>i</sub>'] },
  'def-redox': { k: 'Definition', t: 'Oxidation &amp; reduction', c: B, b: ['Oxidation = loss of electrons', 'Reduction = gain of electrons', 'Always coupled: one donor, one acceptor'], n: 'Memory aid: OIL RIG.' },
  'def-oxphos': { k: 'Definition', t: 'Oxidative phosphorylation', c: V, b: ['Coupling of electron transport with ATP synthesis', 'Needs the ETC and O<sub>2</sub>'] },
  'def-slp': { k: 'Definition', t: 'Substrate-level phosphorylation', c: O, b: ['ATP made without the ETC or O<sub>2</sub>', 'Glycolysis: phosphoglycerate kinase, pyruvate kinase', 'TCA: succinate thiokinase (GTP)'] },

  /* ── mitochondrion ──────────────────────────── */
  'outer-mem': { k: 'Boundary', t: 'Outer membrane', c: '#9fb4ff', b: ['Smooth, freely permeable to small molecules'] },
  'inner-mem': { k: 'The ETC lives here', t: 'Inner membrane', c: '#ff8f66', b: ['Impermeable to H<sup>+</sup> — essential for the gradient', 'Holds Complexes I–IV and ATP synthase'] },
  cristae: { k: 'Folds', t: 'Cristae', c: '#ff8f66', b: ['Folds of the inner membrane', 'Huge surface area → more ETC units'] },
  matrix: { k: 'Inside', t: 'Matrix', c: B, b: ['PDH complex &amp; TCA cycle enzymes', 'Source of NADH &amp; FADH<sub>2</sub>'] },
  ims: { k: 'Between membranes', t: 'Intermembrane space', c: R, b: ['Protons are pumped here', 'Low pH, positive side'] },

  /* ── ETC components ─────────────────────────── */
  C1: { k: 'Complex I', t: 'NADH dehydrogenase', c: '#7d7aff', rows: [['Prosthetic groups', 'FMN · Fe-S'], ['Electrons from', 'NADH'], ['Pumps', '4 H<sup>+</sup>']] },
  C2: { k: 'Complex II', t: 'Succinate dehydrogenase', c: '#d070ff', rows: [['Prosthetic groups', 'FAD · Fe-S'], ['Electrons from', 'FADH<sub>2</sub> (succinate)'], ['Pumps', 'None']], n: 'Also a TCA enzyme (step 6).' },
  C3: { k: 'Complex III', t: 'Cytochrome bc<sub>1</sub> complex', c: '#2d9bff', rows: [['Contains', 'Cyt b · cyt c<sub>1</sub> · Fe-S'], ['Electrons', 'CoQ → cyt c'], ['Pumps', '4 H<sup>+</sup>']] },
  C4: { k: 'Complex IV', t: 'Cytochrome c oxidase', c: '#2ad4b4', rows: [['Contains', 'Cyt a · a<sub>3</sub> · Cu<sub>A</sub> · Cu<sub>B</sub>'], ['Electrons', 'Cyt c → O<sub>2</sub> → H<sub>2</sub>O'], ['Pumps', '2 H<sup>+</sup>']] },
  C5: { k: 'Complex V', t: 'ATP synthase', c: '#ffb340', rows: [['Domains', 'F<sub>o</sub> (membrane) · F<sub>1</sub> (matrix)'], ['Uses', 'H<sup>+</sup> flowing back in'], ['Makes', 'ATP from ADP + P<sub>i</sub>']] },
  mobile: { k: 'Mobile carriers', t: 'Coenzyme Q &amp; cytochrome c', c: '#e5e5ea', rows: [['Coenzyme Q', 'Ubiquinone · lipid-soluble · moves within the membrane'], ['Cytochrome c', 'Water-soluble · moves on the outer face']] },
  coq: { k: 'Mobile carrier', t: 'Coenzyme Q (ubiquinone)', c: Y, b: ['Lipid-soluble — diffuses in the membrane', 'Collects e<sup>−</sup> from Complex I and II', 'Delivers them to Complex III'] },
  cytc: { k: 'Mobile carrier', t: 'Cytochrome c', c: '#ff6482', b: ['Small, water-soluble protein', 'Carries e<sup>−</sup> from Complex III to IV'] },
  nadhTok: { k: 'Electron donor', t: 'NADH + H<sup>+</sup>', c: G, b: ['Delivers 2 e<sup>−</sup> to Complex I', '10 H<sup>+</sup> pumped → 2.5 ATP'] },
  fadhTok: { k: 'Electron donor', t: 'FADH<sub>2</sub>', c: P, b: ['Delivers 2 e<sup>−</sup> via Complex II', 'Skips Complex I → 6 H<sup>+</sup> → 1.5 ATP'] },
  o2Tok: { k: 'Final acceptor', t: 'Oxygen', c: '#64d2ff', b: ['½ O<sub>2</sub> + 2 H<sup>+</sup> + 2 e<sup>−</sup> → H<sub>2</sub>O', 'Without O<sub>2</sub>, the whole chain stops'] },

  /* ── chemiosmosis ───────────────────────────── */
  mitchell: { k: 'Chemiosmotic theory', t: 'Peter Mitchell', c: V, b: ['Proposed that a proton gradient couples electron transport to ATP synthesis', 'Nobel Prize in Chemistry, 1978'] },
  gradient: { k: 'Proton-motive force', t: 'Two gradients in one', c: R, rows: [['Chemical', 'More H<sup>+</sup> outside → ↓pH outside, ↑pH in matrix'], ['Electrical', 'Outside positive, matrix negative']] },
  rule4h: { k: 'Lecture convention', t: '4 H<sup>+</sup> = 1 ATP', c: Y, b: ['≈ 3 H<sup>+</sup> drive ATP synthase', '≈ 1 H<sup>+</sup> pays to import P<sub>i</sub> / export ATP'], n: 'Older texts (incl. older Lippincott editions): NADH = 3 ATP, FADH<sub>2</sub> = 2 ATP.' },

  /* ── ATP synthase ───────────────────────────── */
  F0: { k: 'Membrane domain', t: 'F<sub>o</sub>', c: '#ffb340', rows: [['Location', 'Inner mitochondrial membrane'], ['Parts', 'a subunit · c-ring · peripheral stalk'], ['Role', 'Proton channel; H<sup>+</sup> flow turns the c-ring']], n: 'The "o" stands for oligomycin — it binds here.' },
  F1: { k: 'Matrix domain', t: 'F<sub>1</sub>', c: '#5ac8fa', rows: [['Subunits', 'α<sub>3</sub> β<sub>3</sub> γ δ ε'], ['Catalytic', 'β subunits make ATP'], ['Location', 'Projects into the matrix']] },
  'sub-c': { k: 'F<sub>o</sub> · rotor', t: 'c-ring', c: '#ff9f0a', b: ['Ring of c subunits in the membrane', 'Each H<sup>+</sup> that passes turns it one notch'] },
  'sub-a': { k: 'F<sub>o</sub> · stator', t: 'a subunit', c: '#ff6482', b: ['Forms the proton half-channels', 'H<sup>+</sup> enter, ride the ring, exit to the matrix'] },
  'sub-b': { k: 'Stator', t: 'Peripheral stalk (b)', c: '#bf8cff', b: ['Holds α<sub>3</sub>β<sub>3</sub> still while the rotor spins'], n: 'Textbook figures label it b<sub>2</sub> (bacterial form); mammals have one b subunit plus partner proteins.' },
  'sub-d': { k: 'Stator', t: 'δ subunit', c: '#ff453a', b: ['Caps the head; links it to the peripheral stalk'] },
  'sub-g': { k: 'Rotor', t: 'γ (and ε) central stalk', c: '#30d158', b: ['Turns with the c-ring', 'Its rotation forces the β subunits to change shape'] },
  'sub-ab': { k: 'Catalytic head', t: 'α<sub>3</sub>β<sub>3</sub> hexamer', c: '#5ac8fa', b: ['β subunits bind ADP + P<sub>i</sub> and release ATP', '3 ATP per full turn of the rotor'], n: 'Binding-change mechanism (Paul Boyer; Nobel Prize 1997 with John Walker).' },
  'oligo-coupling': { k: 'Tight coupling', t: 'Then electron flow halts too', c: R, b: ['H<sup>+</sup> cannot re-enter → gradient maxes out', 'Pumps cannot push against it', 'ETC and O<sub>2</sub> use slow down'] },

  /* ── inhibitors ─────────────────────────────── */
  'cls-1': { k: 'Class 1', t: 'Site-specific ETC inhibitors', c: R, b: ['Block electron flow at a complex', 'Upstream carriers stay reduced', 'No flow → no pumping → no ATP'] },
  'cls-2': { k: 'Class 2', t: 'ATP synthase inhibitors', c: O, b: ['Oligomycin plugs F<sub>o</sub>', 'H<sup>+</sup> cannot re-enter → no phosphorylation'] },
  'cls-3': { k: 'Class 3', t: 'Uncouplers', c: '#ff7a1a', b: ['Let H<sup>+</sup> leak back across the membrane', 'Electron flow continues, ATP synthesis stops', 'Energy released as heat'] },
  rotenone: { k: 'Complex I', t: 'Rotenone', c: '#7d7aff', b: ['Insecticide / fish poison', 'Blocks FMN → Fe-S → CoQ transfer'] },
  amobarbital: { k: 'Complex I', t: 'Amobarbital', c: '#7d7aff', b: ['A barbiturate (amytal)', 'Blocks Complex I'] },
  piericidin: { k: 'Complex I', t: 'Piericidin', c: '#7d7aff', b: ['Antibiotic', 'Blocks Complex I'] },
  antimycin: { k: 'Complex III', t: 'Antimycin A', c: '#2d9bff', b: ['Antibiotic', 'Blocks cyt b → cyt c<sub>1</sub>'] },
  bal: { k: 'Complex III', t: 'Dimercaprol (BAL)', c: '#2d9bff', b: ['BAL = British anti-Lewisite = dimercaprol', 'Blocks Complex III'] },
  cyanide: { k: 'Complex IV', t: 'Cyanide (CN<sup>−</sup>)', c: '#2ad4b4', b: ['Binds the heme a<sub>3</sub> iron of cytochrome c oxidase', 'O<sub>2</sub> can no longer accept electrons'] },
  co: { k: 'Complex IV', t: 'Carbon monoxide', c: '#2ad4b4', b: ['Binds cytochrome c oxidase (and hemoglobin)', 'Blocks the final transfer to O<sub>2</sub>'] },
  h2s: { k: 'Complex IV', t: 'Hydrogen sulfide', c: '#2ad4b4', b: ['Inhibits cytochrome c oxidase', 'Same final block as cyanide'] },
  oligomycin: { k: 'ATP synthase', t: 'Oligomycin', c: O, b: ['Binds F<sub>o</sub>', 'H<sup>+</sup> cannot re-enter → no ATP', 'Gradient builds → electron flow slows'] },
  dnp: { k: 'Uncoupler', t: '2,4-Dinitrophenol (DNP)', c: '#ff7a1a', b: ['Carries H<sup>+</sup> across the inner membrane', 'Once sold for weight loss — causes dangerous hyperthermia'] },
  dicumarol: { k: 'Uncoupler', t: 'Dicumarol', c: '#ff7a1a', b: ['Vitamin K antagonist (anticoagulant)', 'Also uncouples oxidative phosphorylation'] },
  salicylate: { k: 'Uncoupler', t: 'Salicylate', c: '#ff7a1a', b: ['Toxic doses of aspirin uncouple', 'Explains the fever of salicylate poisoning'] },
  ucp1: { k: 'Physiological uncoupler', t: 'Uncoupling protein 1 (thermogenin)', c: '#ff7a1a', b: ['Proton channel in brown adipose tissue', 'Non-shivering heat production — important in newborns'] },
  crossover: { k: 'Crossover', t: 'Before vs after the block', c: Y, b: ['Carriers before the block: fully reduced (bright)', 'Carriers after it: oxidized (dark)'] },

  /* ── energetics ─────────────────────────────── */
  'en-nadh': { k: '3 per turn', t: 'NADH', c: G, rows: [['From', 'Steps 3, 4 and 8'], ['Worth', '2.5 ATP each']] },
  'en-fadh': { k: '1 per turn', t: 'FADH<sub>2</sub>', c: P, rows: [['From', 'Step 6 (succinate DH)'], ['Worth', '1.5 ATP']] },
  'en-gtp': { k: '1 per turn', t: 'GTP', c: O, rows: [['From', 'Step 5 (succinate thiokinase)'], ['Worth', '1 ATP — substrate-level']] },
  'en-co2': { k: '2 per turn', t: 'CO<sub>2</sub>', c: '#6aa8ff', rows: [['From', 'Steps 3 and 4'], ['Note', 'Carbon in = carbon out (2 C)']] },
  shuttle: { k: 'Cytosolic NADH', t: 'Why a shuttle?', c: B, b: ['NADH from glycolysis cannot cross the inner membrane', 'Malate–aspartate shuttle → NADH (2.5 ATP)', 'Glycerol-3-phosphate shuttle → FADH<sub>2</sub> (1.5 ATP)'] },
};

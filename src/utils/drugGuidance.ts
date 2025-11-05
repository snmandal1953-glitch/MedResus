export type Drug = {
  id: string;
  name: string;
  adultDose: string;
  paediatricDose?: string;
  reconstitution?: string;
  indications?: string[];
  notes?: string;
};

// Guideline-style drug guidance focused on resuscitation/reversible causes.
// Adapt doses to local protocols and available ampoule strengths in your hospital.

export const drugs: Drug[] = [
  {
    id: 'adrenaline',
    name: 'Adrenaline (Epinephrine)',
    adultDose: '1 mg IV/IO every 3–5 min (cardiac arrest)',
    paediatricDose: '0.01 mg/kg IV/IO (0.1 mL/kg of 1:10,000); max single 1 mg',
    reconstitution:
      "Common in India: 1:1000 (1 mg/mL) ampoule (1 mL) and 1:10,000 (0.1 mg/mL) 10 mL ampoule.\nIf only 1:1000 available: draw 1 mL (1 mg) and dilute into 9 mL saline to make 10 mL of 1:10,000 (0.1 mg/mL); give 1 mL of this for 0.1 mg.\nFor paediatric dosing use 0.1 mL/kg of 1:10,000 solution.",
    indications: ['Hypoxia', 'Cardiac arrest algorithm', 'Toxins where indicated'],
    notes: 'IV/IO preferred; intraosseous if no IV access. Endotracheal route less reliable.'
  },
  {
    id: 'amiodarone',
    name: 'Amiodarone',
    adultDose: '300 mg IV bolus for shock-refractory VF/VT; additional 150 mg if required',
    paediatricDose: '5 mg/kg IV/IO (may repeat; max single 300 mg)',
    reconstitution:
      'Amiodarone often supplied as 150 mg/3 mL or 300 mg vials. For bolus, dilute in 50–100 mL D5W and give as per local protocol. Avoid mixing in saline for infusion.',
    indications: ['Tachyarrhythmia (VF/VT)'],
    notes: 'Can cause hypotension; give slowly if concerned.'
  },
  {
    id: 'lidocaine',
    name: 'Lidocaine',
    adultDose: '1–1.5 mg/kg IV/IO bolus for VF/VT; repeat 0.5–0.75 mg/kg',
    paediatricDose: '1 mg/kg IV/IO (1–1.5 mg/kg per protocol)',
    reconstitution:
      'Lidocaine commonly available as 2% (20 mg/mL) ampoules. Calculate volume needed and dilute into saline if an infusion is required.',
    indications: ['Tachyarrhythmia (alternative to amiodarone)']
  },
  {
    id: 'magnesium',
    name: 'Magnesium sulfate',
    adultDose: '1–2 g IV bolus for torsades de pointes or suspected hypomagnesaemia',
    paediatricDose: '25–50 mg/kg IV (max 2 g)',
    reconstitution:
      'Magnesium sulfate commonly available as 500 mg/mL (e.g., 10 mL = 5 g). For 2 g dose, draw appropriate volume (check concentration) and dilute in 10–20 mL saline for slow IV.',
    indications: ['Torsades de pointes', 'Electrolyte disturbance (H)']
  },
  {
    id: 'calcium_chloride',
    name: 'Calcium chloride (10%)',
    adultDose: '1 g IV (10 mL of 10% solution) for hyperkalaemia or calcium-channel blocker overdose',
    paediatricDose: '20 mg/kg IV (10% solution) slow IV',
    reconstitution:
      'Calcium chloride is usually supplied as 10% solution (10 mL ampoule = 1 g). Administer slowly with ECG monitoring; avoid peripheral extravasation.',
    indications: ['Hyperkalaemia (H)', 'Calcium-channel blocker overdose (T)'],
    notes: 'Do not mix with bicarbonate in same line (precipitation).' 
  },
  {
    id: 'bicarbonate',
    name: 'Sodium bicarbonate',
    adultDose: '50 mEq IV (or 1–2 mEq/kg in severe acidosis/hyperkalaemia)',
    paediatricDose: '1–2 mEq/kg IV in severe metabolic acidosis',
    reconstitution:
      'Sodium bicarbonate commonly available as 7.5% or 8.4% ampoules (~1 mEq/mL). Use weight-based dosing for severe acidosis and dilute if giving larger volumes.',
    indications: ['Severe metabolic acidosis (H)', 'TCA overdose (T)', 'Hyperkalaemia (H)'],
    notes: 'Not routinely indicated in arrest absent specific cause.'
  },
  {
    id: 'insulin_dextrose',
    name: 'Insulin + Dextrose (for hyperkalaemia)',
    adultDose: '10 units IV regular insulin + 25–50 g 50% dextrose (or 250 mL 10% dextrose) depending on local practice; monitor glucose closely',
    paediatricDose: '0.1 U/kg IV insulin with appropriate dextrose bolus (check local protocol)',
    reconstitution:
      'Use regular insulin (Actrapid/Humulin R) and dextrose 50% or 10% as per patient size. Ensure bedside glucose monitoring available.',
    indications: ['Hyperkalaemia (H)'],
    notes: 'Temporary shift of K+ intracellularly; consider definitive measures (dialysis) as needed.'
  },
  {
    id: 'alteplase',
    name: 'Alteplase (tPA)',
    adultDose: 'Protocols vary; for suspected massive PE in arrest some centres use 50 mg IV bolus (others 100 mg infusion). Follow local thrombolysis protocol.',
    reconstitution:
      'Alteplase supplied as lyophilised powder (e.g., 50 mg vials). Reconstitute with sterile water as per manufacturer (often 50 mL for 50 mg → 1 mg/mL). Thrombolysis in arrest is high-risk—use local guidance.',
    indications: ['Massive pulmonary embolism (T)'],
    notes: 'High bleeding risk; consult local guidelines.'
  },
  {
    id: 'naloxone',
    name: 'Naloxone',
    adultDose: '0.4 mg IV/IM/IN (400 mcg) titrated up to 2 mg IV for opioid overdose',
    reconstitution: 'Naloxone commonly available as 0.4 mg/mL ampoules. Use appropriate volume for dose and monitor respiratory status.',
    indications: ['Opioid overdose (T)'],
    notes: 'May precipitate acute withdrawal.'
  }
];

// Additional crash-cart and thrombolytic drugs commonly encountered in Indian settings
const extra: Drug[] = [
  {
    id: 'tenecteplase',
    name: 'Tenecteplase (TNK)',
    adultDose:
      'Dose depends on indication and local protocol. For suspected PE in arrest some centres use 50 mg IV bolus; for STEMI there are weight-based single-bolus regimens (consult local protocol).',
    reconstitution:
      'Tenecteplase supplied as single-use vials (reconstitute per manufacturer). Dosing varies — follow local thrombolysis policy. Thrombolysis in cardiac arrest is high-risk and should follow local algorithms.',
    indications: ['Massive pulmonary embolism (T)', 'Selected thrombolysis indications'],
    notes: 'Use only per protocol; ensure contraindications checked.'
  },
  {
    id: 'streptokinase',
    name: 'Streptokinase (STK)',
    adultDose: '1.5 million IU IV over 30–60 minutes (regimen varies by indication and local policy)',
    reconstitution:
      'Streptokinase supplied as lyophilised powder (e.g., 1.5 million IU vials). Reconstitute with sterile water as per manufacturer. Ensure full dose and infusion set ready; follow local protocol.',
    indications: ['Thrombolysis – some centres still use STK for MI/PE per local availability (T)'],
    notes: 'High bleeding risk; use per local guidelines and after discussing risks.'
  },
  {
    id: 'calcium_gluconate',
    name: 'Calcium gluconate (10%)',
    adultDose: '10 mL IV of 10% solution (slow IV bolus) — may repeat if indicated; used for hyperkalaemia or CCB overdose where peripheral access only',
    paediatricDose: '20 mg/kg IV slow (10% solution)',
    reconstitution: 'Usually supplied as 10 mL ampoules of 10% solution. Administer slowly while monitoring ECG.',
    indications: ['Hyperkalaemia (H)', 'Calcium-channel blocker overdose (T)'],
    notes: 'Calcium chloride contains more elemental calcium and is preferred if central access available; calcium gluconate is less irritant peripherally.'
  },
  {
    id: 'atropine',
    name: 'Atropine',
    adultDose: '0.5 mg IV bolus for symptomatic bradycardia; repeat every 3–5 min to a total of 3 mg',
    paediatricDose: '20 mcg/kg IV/IM (0.02 mg/kg), minimum dose 0.1 mg, max single 0.5–1 mg depending on age',
    reconstitution: 'Atropine commonly available as 0.6 mg/1 mL or 1 mg/mL ampoules. Draw required volume for dose.',
    indications: ['Bradycardia', 'Organophosphate poisoning (higher dosing protocols)']
  },
  {
    id: 'vasopressin',
    name: 'Vasopressin',
    adultDose: '20 units IV bolus (historical alternative to vasopressors in resuscitation; many protocols no longer routinely recommend)',
    reconstitution: 'Vasopressin supplied in 20 U/mL ampoules typically. Use per local advanced life support guidance.',
    indications: ['Vasodilatory shock in some protocols (use per local guidance)'],
    notes: 'Check local ALS guidance — vasopressin use varies.'
  },
  {
    id: 'tranexamic_acid',
    name: 'Tranexamic acid (TXA)',
    adultDose: '1 g IV bolus over 10 min (for trauma/bleeding); followed by infusion per protocol',
    reconstitution: 'TXA commonly available as 100 mg/mL (10 mL = 1 g) vials. Draw and dilute as required.',
    indications: ['Major haemorrhage (H)'],
    notes: 'Use according to massive haemorrhage protocols; early administration in trauma is beneficial.'
  }
];

// RSI, anticonvulsant and opioid agents commonly used during resuscitation/rapid sequence intubation
const rsi: Drug[] = [
  {
    id: 'etomidate',
    name: 'Etomidate',
    adultDose: '0.2–0.3 mg/kg IV single bolus for induction (commonly 20 mg adult dose)',
    paediatricDose: '0.2–0.3 mg/kg IV (age dependent)',
    reconstitution: 'Etomidate usually supplied as 2 mg/mL ampoules; draw calculated volume for weight-based dosing.',
    indications: ['Induction for RSI — haemodynamically unstable patients often receive etomidate'],
    notes: 'Can cause myoclonus; use adjuvants per local practice.'
  },
  {
    id: 'ketamine',
    name: 'Ketamine',
    adultDose: '1–2 mg/kg IV for induction (lower doses for analgesia 0.5–1 mg/kg)',
    paediatricDose: '1–2 mg/kg IV for induction',
    reconstitution: 'Ketamine typically comes as 50 mg/mL or 10 mg/mL vials depending on manufacturer; dilute as needed for infusion.',
    indications: ['Induction for RSI, analgesia; useful in hypotension as it supports blood pressure'],
    notes: 'Can increase secretions and intracranial pressure; weigh risks/benefits.'
  },
  {
    id: 'propofol',
    name: 'Propofol',
    adultDose: '1–2.5 mg/kg IV for induction (titrate in haemodynamically unstable patients)',
    paediatricDose: '2–3 mg/kg IV for induction (age dependent)',
    reconstitution: 'Propofol is supplied as an emulsion in 10 mL/20 mL vials; use strict asepsis. Caution in hypotension.',
    indications: ['Induction for RSI (avoid in severe hypotension)'],
    notes: 'Causes dose-dependent hypotension; ensure vasopressor support available if needed.'
  },
  {
    id: 'succinylcholine',
    name: 'Succinylcholine (Suxamethonium)',
    adultDose: '1–1.5 mg/kg IV bolus for paralysis (rapid onset, short duration)',
    paediatricDose: '1–2 mg/kg IV/IM depending on age',
    reconstitution: 'Succinylcholine commonly available as 100 mg vials (10 mg/mL). Draw required dose and flush with saline.',
    indications: ['Neuromuscular blockade for RSI (avoid in hyperkalaemia, severe burns, neuromuscular disease)'],
    notes: 'Contraindicated in hyperkalaemia; check indications.'
  },
  {
    id: 'rocuronium',
    name: 'Rocuronium',
    adultDose: '0.6–1.2 mg/kg IV bolus for rapid sequence intubation (1 mg/kg for rapid onset)',
    paediatricDose: '0.6–1.2 mg/kg IV depending on age',
    reconstitution: 'Rocuronium typically supplied as 10 mg/mL vials; prepare drawn dose for bolus or infusion.',
    indications: ['Neuromuscular blockade for RSI; alternative to succinylcholine'],
    notes: 'Longer duration than succinylcholine; consider reversal strategies if needed.'
  },
  {
    id: 'atracurium',
    name: 'Atracurium',
    adultDose: '0.4–0.5 mg/kg IV bolus for neuromuscular blockade (intermediate duration); common choice where organ-independent elimination is preferred',
    paediatricDose: '0.5–0.6 mg/kg IV depending on age and protocol',
    reconstitution: 'Atracurium typically supplied as 10 mg/mL vials. Draw calculated dose for bolus and dilute per local protocol for infusion.',
    indications: ['Neuromuscular blockade for RSI; alternative to rocuronium/suxamethonium when organ-independent metabolism preferred'],
    notes: 'Useful in patients with renal or hepatic impairment due to Hofmann elimination; monitor for histamine-related hypotension with rapid administration.'
  },
  {
    id: 'fentanyl',
    name: 'Fentanyl',
    adultDose: '1–2 mcg/kg IV for analgesia/RSI (common adult bolus 50–100 mcg)',
    paediatricDose: '1–2 mcg/kg IV',
    reconstitution: 'Fentanyl often available as 50 mcg/mL or 100 mcg/mL ampoules/vials. Draw calculated volume for bolus.',
    indications: ['Analgesia, blunting sympathetic response to laryngoscopy during RSI'],
    notes: 'May cause respiratory depression; titrate carefully.'
  },
  {
    id: 'midazolam',
    name: 'Midazolam',
    adultDose: '0.05–0.1 mg/kg IV for sedation (commonly 1–2 mg incremental doses)',
    paediatricDose: '0.05–0.1 mg/kg IV/IM',
    reconstitution: 'Midazolam commonly available as 1 mg/mL or 5 mg/mL ampoules. Draw dose and administer slowly.',
    indications: ['Sedation, seizure control adjunct (but benzodiazepines first-line for active seizures)'],
    notes: 'Use cautiously with opioids; causes respiratory depression.'
  },
  {
    id: 'levetiracetam',
    name: 'Levetiracetam (anti-seizure)',
    adultDose: '1–3 g IV loading dose (common 1–2 g bolus) for status epilepticus if benzodiazepines insufficient; follow local protocol',
    paediatricDose: '20–40 mg/kg IV (often 20 mg/kg bolus) depending on protocol',
    reconstitution: 'Levetiracetam commonly supplied as 500 mg/5 mL or 1 g/10 mL solution for injection — administer per label and dilute if necessary.',
    indications: ['Seizures/status epilepticus (H/T where seizure is cause)'],
    notes: 'Often used as second-line after benzodiazepines for status epilepticus.'
  }
];

export const allDrugs: Drug[] = [...drugs, ...extra, ...rsi];

export function getDrugById(id: string): Drug | undefined {
  return allDrugs.find(d => d.id === id);
}

export function paediatricDoses(weightKg?: number) {
  const w = weightKg && weightKg > 0 ? weightKg : 20;
  return {
    adrenaline: `Adrenaline ${(0.01 * w).toFixed(2)} mg IV/IO (0.1 mL/kg of 1:10,000) — repeat every 3–5 min`,
    amiodarone: `${(5 * w).toFixed(0)} mg IV/IO (5 mg/kg) — max single 300 mg`,
    lidocaine: `${(1 * w).toFixed(0)}–${(1.5 * w).toFixed(0)} mg IV/IO (1–1.5 mg/kg)`,
    magnesium: `${(25 * w).toFixed(0)}–${(50 * w).toFixed(0)} mg IV (25–50 mg/kg) — max 2 g`,
    calcium: `${(20 * w).toFixed(0)} mg IV (20 mg/kg of 10% solution)`
  };
}
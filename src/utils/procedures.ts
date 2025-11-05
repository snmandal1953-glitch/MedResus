import { ProcedureChip } from "../data/types";

// Simple helpers
export const ettSizeByAge = (ageYears: number) => ({
  uncuffed: +(4 + ageYears / 4).toFixed(1),
  cuffed: +(3.5 + ageYears / 4).toFixed(1),
});

export const opaSizes: ProcedureChip[] = [
  { group: "Airway", label: "OPA Size 0 (neonate)" },
  { group: "Airway", label: "OPA Size 1 (infant)" },
  { group: "Airway", label: "OPA Size 2 (child)" },
  { group: "Airway", label: "OPA Size 3 (small adult)" },
  { group: "Airway", label: "OPA Size 4 (adult)" },
  { group: "Airway", label: "OPA Size 5 (large adult)" },
];

export const npaSizes: ProcedureChip[] = [
  { group: "Airway", label: "NPA 6.0 mm" },
  { group: "Airway", label: "NPA 6.5 mm" },
  { group: "Airway", label: "NPA 7.0 mm" },
  { group: "Airway", label: "NPA 7.5 mm" },
  { group: "Airway", label: "NPA 8.0 mm" },
];

export const lmaSizes: ProcedureChip[] = [
  { group: "Airway", label: "LMA Size 1 (≤5 kg)" },
  { group: "Airway", label: "LMA Size 1.5 (5–10 kg)" },
  { group: "Airway", label: "LMA Size 2 (10–20 kg)" },
  { group: "Airway", label: "LMA Size 2.5 (20–30 kg)" },
  { group: "Airway", label: "LMA Size 3 (30–50 kg)" },
  { group: "Airway", label: "LMA Size 4 (50–70 kg)" },
  { group: "Airway", label: "LMA Size 5 (70–100 kg)" },
];

export const ettCommon: ProcedureChip[] = [
  { group: "Airway", label: "ETT 6.5 mm" },
  { group: "Airway", label: "ETT 7.0 mm" },
  { group: "Airway", label: "ETT 7.5 mm" },
  { group: "Airway", label: "ETT 8.0 mm" },
  { group: "Airway", label: "ETT 8.5 mm" },
];

export const ioIv: ProcedureChip[] = [
  { group: "Access", label: "IV 18G" },
  { group: "Access", label: "IV 16G" },
  { group: "Access", label: "IV 14G" },
  { group: "Access", label: "IO Tibia (adult)" },
  { group: "Access", label: "IO Tibia (peds)" },
  { group: "Access", label: "IO Humerus" },
];

export const chestTubes: ProcedureChip[] = [
  { group: "Breathing", label: "Chest tube 16 Fr (peds)" },
  { group: "Breathing", label: "Chest tube 20 Fr" },
  { group: "Breathing", label: "Chest tube 24 Fr" },
  { group: "Breathing", label: "Chest tube 28 Fr" },
  { group: "Breathing", label: "Chest tube 32 Fr" },
  { group: "Breathing", label: "Chest tube 36 Fr" },
];

export const defibSafety: ProcedureChip[] = [
  { group: "Defib", label: "Pads placed (AP/AL)" },
  { group: "Defib", label: "O2 away from chest" },
  { group: "Defib", label: "Everyone clear" },
  { group: "Defib", label: "Shock delivered" },
];

export const bainCircuit: ProcedureChip[] = [
  { group: "Airway", label: "Bain circuit checked" },
  { group: "Airway", label: "Ambu bag ready" },
];

export const PROCEDURE_CHIPS: ProcedureChip[] = [
  ...opaSizes,
  ...npaSizes,
  ...lmaSizes,
  ...ettCommon,
  ...ioIv,
  ...chestTubes,
  ...defibSafety,
  ...bainCircuit,
];

export const HsTs: { key: string; tip: string }[] = [
  { key: "Hypoxia", tip: "Bag‑mask, 100% O2, verify ETCO2/SpO2" },
  { key: "Hypovolemia", tip: "Bolus fluids, FAST, hemorrhage control" },
  { key: "Hydrogen ions (Acidosis)", tip: "ABG/VBG, ventilate; consider HCO3‑ in severe" },
  { key: "Hypo/Hyperkalemia", tip: "ECG, CaCl, Insulin+Dextrose, Neb Salbutamol" },
  { key: "Hypothermia", tip: "Warm IV fluids, active rewarming" },
  { key: "Tension pneumothorax", tip: "Needle decompression, chest tube" },
  { key: "Tamponade (cardiac)", tip: "POCUS, pericardiocentesis" },
  { key: "Toxins", tip: "Antidotes, tox consult, charcoal if indicated" },
  { key: "Thrombosis (pulmonary)", tip: "Thrombolysis if massive PE" },
  { key: "Thrombosis (coronary)", tip: "STEMI pathway, PCI" },
];
# Copilot instructions for MedResus

Quick, focused guidance for code assistants working on this repository.

- Project type: Expo React Native (see `package.json` scripts). App entry is `App.tsx` registered in `index.ts`.
- Navigation: `src/navigation/RootNavigator.tsx` uses a `Bootstrap` step that reads `userProfile` and `disclaimerAccepted` from storage to route to `Login`, `Disclaimer` or `Home`.
- Persistent storage: small wrapper at `src/services/storage.ts` (AsyncStorage). Important keys used across the app:
  - `activeCaseId`, `case:<id>` — active case snapshot (see `src/screens/CodeBlueScreen.tsx`).
  - `MED_RESUS_ARCHIVE` — archive list (see `src/services/archive.ts`).
  - `reversibleCauses`, `userProfile`, `disclaimerAccepted` — other small keys used by bootstrap and features.
- Primary UX surface: `src/screens/CodeBlueScreen.tsx` — event-driven case logging. Note:
  - Events are prepended to `events` array (newest first) and persisted with a 350ms timeout debounce.
  - CPR timer uses a 2-minute interval with haptic/alert when complete.
  - CSV export flow: `src/services/exportCSV.ts` → `expo-file-system`, then email via `expo-mail-composer` (see `exportAndEmail` in `CodeBlueScreen`).
- Data shapes and types live in `src/data/types.ts` — consult this file when modifying case/log structures or archive formats.

- i18n: strings and simple provider are in `src/i18n/strings.ts` and `src/i18n/I18nContext.tsx`. The app cycles languages EN → HI → HI_EN via `toggleLang`.

- Conventions & patterns specific to this repo:
  - Small, focused service modules in `src/services/*` (storage, archive, exportCSV). Prefer adding helpers here rather than ad-hoc AsyncStorage calls.
  - UI is function components with local state + small helpers; mutate case state via `setCs({...cs, events: [...]})` not deep object mutation.
  - IDs are generated with `Math.random().toString(36).slice(2,8)` style helpers in screens (see `newId` in `CodeBlueScreen`). Keep IDs short and predictable if adding features.
  - Time formatting helpers (e.g., `fmtElapsed`) are used across screens — reuse rather than duplicate.

- Build / dev / debugging:
  - Start dev server: `npm start` (runs `expo start`). Use `npm run ios` / `npm run android` / `npm run web` for platform shortcuts.
  - This is an Expo-managed project (check `expo` and `eas.json` if building native/eas workflows).
  - Common runtime integration points to mock or stub in tests: `@react-native-async-storage/async-storage`, `expo-file-system`, `expo-mail-composer`, `expo-haptics`.

- Integration notes for changes:
  - When changing the case format, update `src/data/types.ts`, storage keys, and CSV export mapping in `src/screens/CodeBlueScreen.tsx` and `src/services/exportCSV.ts`.
  - When adding features that persist, use `storage.set/get` to encapsulate AsyncStorage parsing and error handling.

- Small examples (copy/paste friendly):
  - Read active case: `await storage.get<CaseState>(\`case:${id}\`)` (see `loadOrCreateCase` in `CodeBlueScreen`).
  - Save CSV and compose email: `const uri = await saveCsv('file.csv', rows); await MailComposer.composeAsync({ attachments: [uri], ... })`.

- When to ask the maintainer:
  - Any change that migrates storage key formats or archive schema (they may need migration tooling).
  - If you plan to add background timers or native modules — check Expo SDK compatibility first (project uses Expo SDK specified in `package.json`).

If anything in these notes is unclear or you want the file to include more examples (e.g., common refactors, test harnesses, or a short list of keys), tell me which area to expand and I will update this file.

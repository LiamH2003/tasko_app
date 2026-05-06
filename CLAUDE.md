# Tasko App

Children's routine & wellbeing app for ages 9-12. Kids follow daily routines to earn XP and evolve their monster companion. Parents get a lightweight dashboard with privacy-respecting insights.

## Tech stack

- **Client**: React Native (Expo Router), TypeScript, React Context for state
- **Server**: Node.js + Express + Mongoose, JWT auth
- **Database**: MongoDB

## Project structure

```
tasko_app/
├── app/                        # Expo Router screens (file-based routing)
│   ├── (onboarding)/           # Welcome + profile setup
│   ├── (child)/                # Child-facing tabs: Home, Tasks, Mood
│   └── (parent)/               # Parent dashboard: Overview, Routines, Settings
├── components/
│   ├── ui/                     # Button, ProgressBar
│   ├── monster/                # MonsterDisplay
│   ├── tasks/                  # TaskItem
│   └── mood/                   # MoodSelector
├── constants/theme.ts          # Colors, Spacing, Radius, FontSize, FontWeight
├── store/useAppStore.tsx       # AppProvider + useAppStore (React Context)
├── types/index.ts              # Shared TypeScript types
├── utils/xp.ts                 # XP math, level → stage mapping
├── hooks/useMonster.ts         # Monster progress convenience hook
├── server/                     # Express backend
│   └── src/
│       ├── routes/             # auth, children, routines, mood
│       ├── controllers/        # Business logic per route group
│       ├── models/             # Mongoose: User, Child, Routine, MoodEntry
│       └── middleware/         # authenticate (JWT), errorHandler
└── docs/                       # Design files and wireframes
```

## Path aliases

`@/*` maps to the repo root (configured in tsconfig.json). Use `@/constants/theme`, `@/store/useAppStore`, etc.

## Design principles

- Dark theme: `Colors.background` (#0f1520) with teal primary (`#4ecdc4`)
- All theme tokens live in `constants/theme.ts` — never hardcode colors or spacing
- Dutch UI strings throughout (target market: Netherlands/Belgium)
- No competitive features, no notifications, no ads
- Monster acts as emotional proxy — rewards honesty over perfection

## Coding conventions

- Functional components with hooks only
- `StyleSheet.create` for all styles, colocated with the component
- Export named components (not default where avoidable in shared components)
- Commit prefixes: `feat:`, `fix:`, `refactor:`, `docs:`
- Always branch off `main` — never commit directly

## Running the project

```bash
# Client
npx expo start

# Server (first: npm install inside server/)
cd server && npm run dev
```

## Screen priority

1. `(onboarding)/index` — welcome/splash (matches design mockup)
2. `(onboarding)/profile-setup` — name + monster name
3. `(child)/index` — home: monster + XP bar + today's tasks
4. `(child)/tasks` — full routine list
5. `(child)/mood` — mood check-in
6. `(parent)/index` — parent dashboard

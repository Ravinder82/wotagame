# WotaGame Studio — OpenBot setup files

This package contains the updated setup files for the first WotaGame autonomous product and growth agent.

## Canonical project details

- Product: WotaGame
- Live website: https://wotagame.vercel.app/
- GitHub: https://github.com/Ravinder82/wotagame
- Local project: existing WotaGame folder in the Mac developer directory

## Files

- `WotaGame_OpenBot_Agent_Instructions.md` — paste into the OpenBot agent's persistent instructions/system prompt.
- `WotaGame_First_Mission.md` — paste as the first task in a new conversation with that agent.

## Setup

1. Create or open the OpenBot agent you intend to use for this project.
2. Replace the old XPlayerCards-specific persistent instructions with `WotaGame_OpenBot_Agent_Instructions.md`.
3. Start a fresh conversation and paste `WotaGame_First_Mission.md`.
4. Confirm that the agent uses the existing local project rather than creating a duplicate.
5. Keep all work local during the first cycle. Review the report and diff before authorizing remote or production changes.

## Safety reminder

Instructions are not a security sandbox. Enforce approval requirements through tool permissions, protected Git branches, development-only database credentials, and deployment controls where possible. Never provide the agent with unnecessary production credentials.

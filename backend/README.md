# Insyd Notifications Backend

## Setup
```bash
cd backend
cp .env.example .env
npm install
npm run seed   # optional: seed sample users
npm run dev
```
API will run at `http://localhost:4000`.

## Endpoints
- `POST /api/events` — create an event and fan-out (body: `{ type, sourceUserId, targetUserId?, data? }`)
- `GET /api/notifications?userId=alice&limit=20&cursor=<id>` — list notifications for a user
- `POST /api/notifications/simulate` — quick enqueue without persisting event

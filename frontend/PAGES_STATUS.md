## Frontend Pages Status

Currently there is a single Next.js page route:

- `/` from `app/page.tsx` (home/dashboard, all sections are on this page)

Sections that exist on the home page (anchor targets):

- `#radar` (Live Radar)
- `#markets` (Momentum Stream / Markets)
- `#leaderboard` (Leaderboard)
- `#wallet` (Wallet)

Navigation items that do not map to a section or a route yet:

- `#dashboard` (Navbar link has no matching section id)
- `settings` (Sidebar bottom item, no section or route)
- `help` (Sidebar bottom item, no section or route)

If you want separate pages instead of a single-page layout, create routes for:

- `/markets`
- `/radar`
- `/leaderboard`
- `/wallet`
- `/settings`
- `/help`

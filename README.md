Play the game here 👉 https://tic-tac-toe-frontend-gfvvs7v4a-sri-nityas-projects.vercel.app/
## ⚠️ Note on Initial Load

The backend is hosted on Render free tier, which may cause a short delay (cold start) when the service is inactive.

- On first load, the connection may fail initially
- Please wait a few seconds and refresh the page once or twice

After the backend wakes up, the application works normally without issues.

## Setup and Installation
1. Clone the repository and navigate into the folder
   ```bash
   git clone https://github.com/Sri-Nitya/tic-tac-toe-frontend.git
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Start the development server (Build docker first. Refer to [backend](https://github.com/Sri-Nitya/tic-tac-toe-nakama/blob/main/README.md))
   ```bash
   npm run dev
   ```
## Features
- Create match
- Join using match id
- Quick match (Auto matchmaking)
- Real-time multiplayer gameplay
- Turn based interaction
- Game result display
- Leaderboard

## Backend Communication

The frontend communicates with the Nakama backend using:

WebSocket → real-time gameplay updates

RPC calls → matchmaking and leaderboard

## Deployment

The frontend is deployed on Vercel.

For deployment:

- Set environment variables in Vercel dashboard
- Ensure backend URL is correctly configured

### To test multiplayer functionality:

Open the [application](https://tic-tac-toe-frontend-gfvvs7v4a-sri-nityas-projects.vercel.app/) on two devices or clone the frontend repository and run it locally:

Player 1:
Create a match

Player 2:
Join via quick match or match ID or from the open rooms.

Verify:
- Turn-based gameplay
- Win/draw/lose logic
- Real-time updates
Test disconnect:
- Close one player
- Remaining player should win

⚠️ Note
Opening multiple tabs in the same browser shares session storage and may behave as a single player. Use separate browser sessions for accurate multiplayer testing.

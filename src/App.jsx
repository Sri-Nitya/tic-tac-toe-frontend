import { useEffect, useState } from "react";
import { createSocket } from "./nakama";
import Lobby from "./Lobby";
import Game from "./Game";

function App() {
  const [socket, setSocket] = useState(null);
  const [match, setMatch] = useState(null);
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");
  const [screen, setScreen] = useState(() =>
    localStorage.getItem("nickname") ? "lobby" : "nickname"
  );
  const [nickname, setNickname] = useState(() => localStorage.getItem("nickname") || "");
  const [resultData, setResult] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const { socket, session } = await createSocket();
        setSocket(socket);
        setSession(session);
      } catch (err) {
        console.error("Failed to initialize app:", err);
        setError("Failed to connect to Nakama server.");
      }
    };
    init();
  }, []);

  const handleNicknameContinue = () => {
    const trimmedNickname = nickname.trim();
    if (!trimmedNickname) return;

    localStorage.setItem("nickname", trimmedNickname);
    setNickname(trimmedNickname);
    setScreen("lobby");
  }

  if (error) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>{error}</div>;
  }

  if (!socket || !session) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>Connecting...</div>;
  }

  if (screen === "nickname") {
    return (
      <div className="app-container">
        <div className="app-card">
          <h2>Enter Nickname</h2>

          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Your name"
          />

          <br /><br />

          <button disabled={!nickname.trim()} onClick={handleNicknameContinue}>
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (screen === "lobby") {
    return (
      <Lobby
        socket={socket}
        session={session}
        setMatch={(m) => {
          setMatch(m);
          setScreen("game");
        }}
        nickname={nickname}
      />
    );
  }

  if (screen === "game") {
    return (
      <Game
        socket={socket}
        match={match}
        session={session}
        nickname={nickname}
        onGameEnd={(data) => {
          setMatch(null);
          setResult(data)
          setScreen("result");
        }}
      />
    );
  }

  if (screen === "result") {
    return (
      <div className="app-container">
        <div className="app-card">

          <h2 className="mb-3">
            {resultData?.result === "win" && "🎉 You Won!"}
            {resultData?.result === "lose" && "😔 You Lost"}
            {resultData?.result === "draw" && "🤝 It's a Draw"}
          </h2>

          <p className="mb-2">
            <strong>{nickname}</strong> vs Opponent
          </p>

          <div className="mt-3">

            <button
              className="btn btn-outline-secondary w-100"
              onClick={() => setScreen("lobby")}
            >
              Back to Lobby
            </button>
          </div>

        </div>
      </div>
    );
  }

  return null;
}

export default App;
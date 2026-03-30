import { useEffect, useState } from "react";
import { createSocket } from "./nakama";
import Lobby from "./Lobby";
import Game from "./Game";

function App() {
  const [socket, setSocket] = useState(null);
  const [match, setMatch] = useState(null);
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");
  const [screen, setScreen] = useState("nickname");
  const [nickname, setNickname] = useState("");
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

  if (error) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>{error}</div>;
  }

  if (!socket || !session) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>Connecting...</div>;
  }

  if (screen === "nickname") {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2>Enter Nickname</h2>

        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Your name"
        />

        <br /><br />

        <button
          disabled={!nickname.trim()}
          onClick={() => {
            localStorage.setItem("nickname", nickname);
            setScreen("lobby");
          }}
        >
          Continue
        </button>
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
      <div className="d-flex vh-100 justify-content-center align-items-center bg-light">
        <div className="card p-4 shadow text-center" style={{ width: "350px" }}>

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
}



export default App;
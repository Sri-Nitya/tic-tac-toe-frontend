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
        onGameEnd={() => {
          setMatch(null);
          setScreen("result");
        }}
      />
    );
  }

  if (screen === "result") {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2>Game Over</h2>

        <button onClick={() => setScreen("lobby")}>
          Back to Lobby
        </button>
      </div>
    );
  }
}



export default App;
import { useEffect, useState } from "react";
import { createSocket } from "./nakama";
import Lobby from "./Lobby";
import Game from "./Game";

function App() {
  const [socket, setSocket] = useState(null);
  const [match, setMatch] = useState(null);
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");

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

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      {!match ? (
        <Lobby socket={socket} session={session} setMatch={setMatch} />
      ) : (
        <Game socket={socket} match={match} session={session} />
      )}
    </div>
  );
}

export default App;
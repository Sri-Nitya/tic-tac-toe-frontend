import { useEffect, useState } from "react";
import { createSocket } from "./nakama";
import Lobby from "./Lobby";
import Game from "./Game";

function App() {
  const [socket, setSocket] = useState(null);
  const [match, setMatch] = useState(null);
  const [session, setSession] = useState(null);

  // Create socket once when app loads
  useEffect(() => {
    const init = async () => {
      const result = await createSocket();
      console.log("INIT RESULT:", result);
      const { socket, session } = await createSocket();
      setSocket(socket);
      setSession(session);
    };
    init();
  }, []);

  // Wait until socket is ready
  if (!socket || !session) {
    return <div>Connecting...</div>;
  }

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      {!match ? (
        <Lobby socket={socket} setMatch={setMatch} />
      ) : (
        <Game socket={socket} match={match} session={session} />
      )}
    </div>
  );
}

export default App;
import { useEffect, useState } from "react";
import { client } from "./nakama";

export default function Lobby({ socket, session, setMatch }) {
    const [matchId, setMatchId] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [rooms, setRooms] = useState([]);

    const fetchRooms = async () => {
        try {
            setError("");
            const res = await client.listMatches(session, 20, true, "tic-tac-toe", 0, 2, "");
            setRooms(res.matches || []);
        } catch (err) {
            console.error("Failed to fetch rooms:", err);
            setError("Unable to fetch rooms.");
        }
    };

    useEffect(() => {
        fetchRooms();
    });

    const createMatch = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await client.rpc(session, "create_match", {});
            const data =
                typeof res.payload === "string" ? JSON.parse(res.payload) : res.payload;

            const createdMatchId = data.matchId;
            const joinedMatch = await socket.joinMatch(createdMatchId);
            console.log("Match Id:", createdMatchId);

            setMatchId(createdMatchId);
            setMatch(joinedMatch);
        } catch (err) {
            console.error("Create match failed:", err);
            setError("Unable to create match.");
        } finally {
            setLoading(false);
        }
    };

    const joinMatch = async (idFromList = null) => {
        try {
            setLoading(true);
            setError("");

            const id = (idFromList || matchId).trim();

            if (!id) {
                setError("Please enter a match ID.");
                return;
            }

            const joinedMatch = await socket.joinMatch(id);
            setMatch(joinedMatch);
        } catch (err) {
            console.error("Join match failed:", err);
            setError("Unable to join match. Check the match ID.");
        } finally {
            setLoading(false);
        }
    };

    const quickMatch = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await client.rpc(session, "quick_match", {});
            const data =
                typeof res.payload === "string" ? JSON.parse(res.payload) : res.payload;
            const selectedMatchId = data.matchId;

            const joinedMatch = await socket.joinMatch(selectedMatchId);

            setMatchId(selectedMatchId);
            setMatch(joinedMatch);
        } catch (err) {
            console.error("Quick match failed:", err);
            setError("Unable to find a quick match.");
        } finally {
            setLoading(false);
        }
    };

    return (
    <div style={{ maxWidth: "500px", margin: "0 auto" }}>
      <h1>Tic Tac Toe</h1>

      <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
        <button onClick={createMatch} disabled={loading}>
          {loading ? "Please wait..." : "Create Match"}
        </button>

        <button onClick={quickMatch} disabled={loading}>
          Quick Match
        </button>

        <button onClick={fetchRooms} disabled={loading}>
          Refresh Rooms
        </button>
      </div>

      <br />

      <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
        <input
          placeholder="Enter Match ID"
          value={matchId}
          onChange={(e) => setMatchId(e.target.value)}
        />
        <button onClick={() => joinMatch()} disabled={loading}>
          Join Match
        </button>
      </div>

      <p>Match ID: {matchId || "-"}</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <hr style={{ margin: "24px 0" }} />

      <h3>Open Rooms</h3>

      {rooms.length === 0 ? (
        <p>No open rooms available.</p>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {rooms.map((room) => (
            <div
              key={room.match_id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "12px",
                textAlign: "left",
              }}
            >
              <p><strong>Match ID:</strong> {room.match_id}</p>
              <p><strong>Players:</strong> {room.size}/2</p>
              <button onClick={() => joinMatch(room.match_id)} disabled={loading || room.size >= 2}>
                Join Room
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
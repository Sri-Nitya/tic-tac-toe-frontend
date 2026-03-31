import { useEffect, useState } from "react";
import { client } from "./nakama";

export default function Lobby({ socket, session, setMatch, nickname }) {
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
    }, []);

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
    <div className="app-container">
      <div className="app-card">
        <h2 className="mb-3">Tic Tac Toe</h2>
        <p className="text-muted mb-4">Create a room, join one, or find a quick match.</p>
        <p className="text-muted mb-2">Welcome, {nickname}!</p>


        <div className="d-grid gap-2 mb-3">
          <button className="btn btn-success" onClick={createMatch} disabled={loading}>
            {loading ? "Please wait..." : "Create Match"}
          </button>

          <button className="btn btn-primary" onClick={quickMatch} disabled={loading}>
            Quick Match
          </button>

          <button className="btn btn-outline-secondary" onClick={fetchRooms} disabled={loading}>
            Refresh Rooms
          </button>
        </div>

        <div className="mb-3">
          <input
            className="form-control mb-2"
            placeholder="Enter Match ID"
            value={matchId}
            onChange={(e) => setMatchId(e.target.value)}
          />
          <button className="btn btn-outline-dark w-100" onClick={() => joinMatch()} disabled={loading}>
            Join Match
          </button>
        </div>

        {error && <p className="text-danger small">{error}</p>}

        <hr className="my-4" />

        <h5 className="mb-3">Open Rooms</h5>

        {rooms.length === 0 ? (
          <p className="text-muted mb-0">No open rooms available.</p>
        ) : (
          <div className="room-card border rounded-3 p-3 bg-white">
            {rooms.map((room) => (
              <div
                key={room.match_id}
                className="border rounded-3 p-3 text-start bg-white"
              >
                <p className="mb-1 small text-break">
                  <strong>Match ID:</strong> {room.match_id}
                </p>
                <p className="mb-3 small">
                  <strong>Players:</strong> {room.size}/2
                </p>
                <button
                  className="btn btn-sm btn-outline-primary w-100"
                  onClick={() => joinMatch(room.match_id)}
                  disabled={loading || room.size >= 2}
                >
                  Join Room
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
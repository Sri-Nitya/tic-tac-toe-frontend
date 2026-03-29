import { useState } from "react";
import { client } from "./nakama";

export default function Lobby({ socket, session, setMatch }) {
    const [matchId, setMatchId] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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

    const joinMatch = async () => {
        try {
            setLoading(true);
            setError("");

            if (!matchId.trim()) {
                setError("Please enter a match ID.");
                return;
            }

            const joinedMatch = await socket.joinMatch(matchId.trim());
            setMatch(joinedMatch);
        } catch (err) {
            console.error("Join match failed:", err);
            setError("Unable to join match. Check the match ID.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Tic Tac Toe</h1>

            <button onClick={createMatch} disabled={loading}>
                {loading ? "Please wait..." : "Create Match"}
            </button>

            <br />
            <br />

            <input
                placeholder="Enter Match ID"
                value={matchId}
                onChange={(e) => setMatchId(e.target.value)}
            />

            <button onClick={joinMatch} disabled={loading}>
                Join Match
            </button>

            <p>Match ID: {matchId || "-"}</p>

            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}
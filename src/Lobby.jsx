import { client, session } from "./nakama";
import { useState } from "react";

export default function Lobby({ socket, setMatch }) {
    const [matchId, setMatchId] = useState("");
    const createMatch = async () => {
        const res = await client.rpc(session, "create_match", {});

        const data = typeof res.payload === "string"
            ? JSON.parse(res.payload)
            : res.payload;

        const matchId = data.matchId;

        console.log("Match ID:", matchId);

        const joinedMatch = await socket.joinMatch(matchId);

        setMatchId(matchId);
        setMatch(joinedMatch);
    };

    const joinMatch = async () => {
        const match = await socket.joinMatch(matchId);
        setMatch(match);
    };

    return (
        <div>
            <h1>Tic Tac Toe</h1>
            <button onClick={createMatch}>Create Match</button>
            <br /><br />

            <input
                placeholder="Enter Match ID"
                value={matchId}
                onChange={(e) => setMatchId(e.target.value)}
            />

            <button onClick={joinMatch}>Join Match</button>

            <p>Match ID: {matchId}</p>
        </div>
    );
}

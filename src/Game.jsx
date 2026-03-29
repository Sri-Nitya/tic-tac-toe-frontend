import { useEffect, useState } from "react";

export default function Game({ socket, match, session }) {
    const [board, setBoard] = useState(Array(9).fill(""));
    const [turn, setTurn] = useState("");
    const [status, setStatus] = useState("Waiting for opponent...");
    const [symbol, setSymbol] = useState("");

    useEffect(() => {
        if (!socket) return;

        const handleMatchData = (message) => {
            try {
                const decoded = new TextDecoder().decode(message.data);
                const state = JSON.parse(decoded);

                console.log("STATE:", state);

                if (state.board) {
                    const flatBoard = state.board.flat();
                    setBoard(flatBoard);
                }

                if (state.turn) setTurn(state.turn);

                if (state.players && session) {
                    const myId = session.user_id;
                    if (state.players[myId]) {
                        setSymbol(state.players[myId]);
                    }
                }

                if (state.winner) {
                    setStatus(`Winner: ${state.winner}`);
                } else {
                    setStatus(`Turn: ${state.turn}`);
                }
            } catch (err) {
                console.error("Parse error:", err);
            }
        };

        // eslint-disable-next-line react-hooks/immutability
        socket.onmatchdata = handleMatchData;

        return () => {
            socket.onmatchdata = null;
        };

    }, [socket, session]);

    const sendMove = (index) => {
        console.log("sendMove called");

        if (!socket || !match) {
            console.log("socket or match missing");
            return;
        }

        if (board[index] !== "") {
            console.log("cell already filled");
            return;
        }

        if (turn !== symbol) {
            console.log("not your turn", { turn, symbol });
            return;
        }

        const row = Math.floor(index / 3);
        const col = index % 3;

        console.log("sending move:", row, col);

        const data = new TextEncoder().encode(
            JSON.stringify({ row, col })
        );

        socket.sendMatchState(match.match_id, 1, data);
    };

    return (
        <div style={{ textAlign: "center" }}>
            <h2>You are: {symbol || "..."}</h2>
            <h3>{status}</h3>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 100px)",
                    gap: "10px",
                    justifyContent: "center",
                    marginTop: "20px",
                }}
            >
                {board.map((cell, i) => (
                    <div
                        key={i}
                        onClick={() => {
                            console.log("CLICKED:", i);
                            sendMove(i);
                        }}
                        style={{
                            width: "100px",
                            height: "100px",
                            border: "2px solid black",
                            fontSize: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: turn === symbol ? "pointer" : "not-allowed",
                            opacity: turn === symbol ? 1 : 0.6,
                            background: "#f9f9f9",
                        }}
                    >
                        {cell}
                    </div>
                ))}
            </div>
        </div>
    );
}
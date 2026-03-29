import { useEffect, useState } from "react";

export default function Game({ socket, match, session }) {
    const [board, setBoard] = useState(Array(9).fill(""));
    const [turn, setTurn] = useState("");
    const [status, setStatus] = useState("Waiting for opponent...");
    const [symbol, setSymbol] = useState("");
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        if (!socket) return;

        const handleMatchData = (message) => {
            try {
                const decoded = new TextDecoder().decode(message.data);
                const payload = JSON.parse(decoded);

                console.log("MATCH DATA:", message.op_code, payload);

                if (message.op_code === 1) {
                    if (payload.board) {
                        setBoard(payload.board.flat());
                    }

                    if (payload.turn) {
                        setTurn(payload.turn);
                    }

                    if (payload.players && session) {
                        const myId = session.user_id;
                        if (payload.players[myId]) {
                            setSymbol(payload.players[myId]);
                        }
                    }

                    if (payload.gameOver) {
                        setGameOver(true);
                        if (payload.winner) {
                            setStatus(`Winner: ${payload.winner}`);
                        } else {
                            setStatus("Game over");
                        }
                    } else if (payload.turn) {
                        setStatus(`Turn: ${payload.turn}`);
                    } else {
                        setStatus("Waiting for opponent...");
                    }
                }

                if (message.op_code === 2) {
                    setGameOver(true);

                    if (payload.type === "win") {
                        setStatus(`Winner: ${payload.winner}`);
                    } else if (payload.type === "draw") {
                        setStatus(payload.message || "It's a draw");
                    } else if (payload.type === "disconnect") {
                        setStatus(payload.message || "Opponent disconnected");
                    }
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
        if (!socket || !match || gameOver) return;
        if (!symbol) return;
        if (board[index] !== "") return;
        if (turn !== symbol) return;

        const row = Math.floor(index / 3);
        const col = index % 3;

        const data = new TextEncoder().encode(JSON.stringify({ row, col }));
        socket.sendMatchState(match.match_id, 1, data);
    };
    
    const isMyTurn = turn === symbol && !gameOver;

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
                        onClick={() => sendMove(i)}
                        style={{
                            width: "100px",
                            height: "100px",
                            border: "2px solid black",
                            fontSize: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: isMyTurn && cell === "" ? "pointer" : "not-allowed",
                            opacity: isMyTurn || cell !== "" ? 1 : 0.6,
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
import { useEffect, useState } from "react";

export default function Game({ socket, match, session, nickname, onGameEnd }) {
    const [board, setBoard] = useState(Array(9).fill(""));
    const [turn, setTurn] = useState("");
    const [status, setStatus] = useState("Waiting for opponent...");
    const [symbol, setSymbol] = useState("");
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        if (!match) return;

        const presences = match.presences || [];

        if (presences.length === 0) {
            setSymbol("X");
            setTurn("X");
            setStatus("Waiting for opponent...");
        } else if (presences.length === 1) {
            setSymbol("O");
            setTurn("X");
            setStatus("Opponent's turn");
        }
    }, [match]);

    useEffect(() => {
        if (!socket || !session) return;

        const handleMatchData = (message) => {
            try {
                const decoded = new TextDecoder().decode(message.data);
                const payload = JSON.parse(decoded);


                if (message.op_code === 1) {
                    if (payload.board) {
                        setBoard(payload.board.flat());
                    }

                    if (payload.turn) {
                        setTurn(payload.turn);
                    }

                    if (payload.players) {
                        const myId = session.user_id;
                        const mySymbol = payload.players[myId] || "";
                        const playerCount = Object.keys(payload.players).length;

                        if (mySymbol) {
                            setSymbol(mySymbol);
                        }

                        if (payload.gameOver) {
                            setGameOver(true);

                            const result = payload.winner ? payload.winner === session.user_id ? "win" : "lose" : "draw";
                            setStatus("Game over");
                            if (onGameEnd) {
                                setTimeout(() => onGameEnd({
                                    result,
                                    winner: payload.winner,
                                }), 1500);
                            }
                            return;
                        }

                        if (playerCount < 2) {
                            setStatus("Waiting for opponent...");
                            return;
                        }

                        const currentTurn = payload.turn || turn;

                        if (mySymbol && currentTurn === mySymbol) {
                            setStatus("Your turn");
                        } else {
                            setStatus("Opponent's turn");
                        }
                    }
                }

                if (message.op_code === 2) {
                    setGameOver(true);

                    let result = "draw";

                    if (payload.type === "win") {
                        result = payload.winner === session.user_id ? "win" : "lose";
                    } else if (payload.type === "draw") {
                        result = "draw";
                    } else if (payload.type === "disconnect") {
                        result = "win";
                    }

                    if (onGameEnd) {
                        setTimeout(() => onGameEnd({ result, winner: payload.winner }), 1500);
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
    }, [socket, session, turn, onGameEnd]);

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

    if (status === "Waiting for opponent...") {
        return (
            <div className="app-container">
                <div className="app-card">
                    <h2 className="mb-3">Waiting for opponent...</h2>

                    <div className="d-flex justify-content-center my-3">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>

                    <p className="text-muted">
                        Your room is ready. Another player can join now.
                    </p>

                    {match?.match_id && (
                        <p className="mt-3 small text-break">
                            <strong>Match ID:</strong> {match.match_id}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="app-container">
            <div className="app-card">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="text-center flex-fill">
                        <div className="fw-bold fs-5">{symbol || "X"}</div>
                        <div className="small text-muted">{nickname} (you)</div>
                    </div>
                    <div className="text-center flex-fill">
                        <div className="fw-bold fs-5">
                            {symbol === "X" ? "O" : symbol === "O" ? "X" : "..."}
                        </div>
                        <div className="small text-muted">Opponent</div>
                    </div>
                </div>

                <h3 className="mb-4 fw-semibold">
                    {status}
                </h3>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 90px)",
                        gap: "12px",
                        justifyContent: "center",
                        margin: "0 auto",
                    }}
                >
                    {board.map((cell, i) => (
                        <button
                            key={i}
                            onClick={() => sendMove(i)}
                            disabled={!isMyTurn || cell !== ""}
                            style={{
                                width: "90px",
                                height: "90px",
                                border: "none",
                                borderRadius: "12px",
                                fontSize: "2rem",
                                fontWeight: "600",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: isMyTurn && cell === "" ? "pointer" : "default",
                                color: cell === "X" ? "#000" : cell === "O" ? "#214c8c67" : "transparent",
                                background: "#f3f4f6",
                                boxShadow: "inset 0 0 0 1px #d1d5db",
                                marginTop: "10px",
                            }}
                        >
                            {cell}
                        </button>
                    ))}
                </div>

                <p className="small text-muted mt-4 mb-0">
                    {status}
                </p>
            </div>
        </div>
    );
}
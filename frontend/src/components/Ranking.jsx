import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { getRanking, SOCKET_URL } from "../services/api";

function Ranking() {
  const [ranking, setRanking] = useState([]);
  const [status, setStatus] = useState("Conectando ao ranking...");

  useEffect(() => {
    let mounted = true;

    getRanking()
      .then((response) => {
        if (mounted) setRanking(response.ranking);
      })
      .catch(() => {});

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"]
    });

    socket.on("connect", () => setStatus("Ranking em tempo real"));
    socket.on("disconnect", () => setStatus("Reconectando ao ranking..."));
    socket.on("ranking:update", (payload) => {
      if (mounted) setRanking(payload);
    });

    return () => {
      mounted = false;
      socket.disconnect();
    };
  }, []);

  return (
    <aside className="card ranking-card">
      <div className="badge">{status}</div>
      <h2>Ranking</h2>
      {ranking.length === 0 ? (
        <p>Nenhuma equipe cadastrada ainda.</p>
      ) : (
        <div className="ranking-list">
          {ranking.map((entry) => (
            <div key={entry.albumId} className="ranking-row">
              <div className="ranking-position">{entry.position}º</div>
              <div className="ranking-info">
                <strong>{entry.teamName}</strong>
                <span>{entry.collectedCount}/{entry.totalStickers} figurinhas</span>
              </div>
              <div className="ranking-score">{entry.score}</div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}

export default Ranking;

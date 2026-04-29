import AlbumVirtual from "./AlbumVirtual";
import Ranking from "./Ranking";

function Dashboard({
  team,
  gameData,
  stickersById,
  message,
  onScanSticker,
  onOpenAR,
  onRefresh,
  onReset
}) {
  const collectedCount = team.collectedStickers.length;
  const completed = collectedCount === gameData.totalStickers;

  return (
    <section className="dashboard-grid">
      <div className="card dashboard-main">
        <div className="dashboard-header">
          <div>
            <div className="badge">Equipe</div>
            <h1>{team.teamName}</h1>
          </div>
          <div className="score-pill">{team.score} pts</div>
        </div>

        {message && <div className="message">{message}</div>}

        <div className="progress-box">
          <div>
            <strong>{collectedCount}/{gameData.totalStickers}</strong>
            <span> figurinhas coletadas</span>
          </div>
          <div className="progress-bar">
            <div style={{ width: `${(collectedCount / gameData.totalStickers) * 100}%` }} />
          </div>
        </div>

        {completed && (
          <div className="success-box">
            Parabéns! A equipe completou o álbum mágico.
          </div>
        )}

        <AlbumVirtual team={team} stickers={gameData.stickers} stickersById={stickersById} />

        <div className="button-row">
          <button className="primary-button" onClick={onScanSticker}>Escanear figurinha</button>
          <button className="secondary-button" onClick={onOpenAR}>Ver álbum em RA</button>
          <button className="ghost-button" onClick={onRefresh}>Atualizar</button>
        </div>

        <button className="tiny-link" onClick={onReset}>Usar outro álbum neste aparelho</button>
      </div>

      <Ranking />
    </section>
  );
}

export default Dashboard;

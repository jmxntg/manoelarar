import { useMemo, useState } from "react";
import AlbumVirtual from "./AlbumVirtual";
import { API_URL } from "../services/api";

function AlbumAR({ team, gameData, stickersById, onClose }) {
  const [mode, setMode] = useState("marker");

  const arUrl = useMemo(() => {
    const params = new URLSearchParams({
      albumId: team.albumId,
      api: API_URL
    });
    return `/ar-album.html?${params.toString()}`;
  }, [team.albumId]);

  return (
    <section className="ar-screen ar-page">
      <div className="ar-panel-topbar">
        <div>
          <strong>Álbum em Realidade Aumentada</strong>
          <span>{team.teamName} · {team.score} pts · {team.collectedStickers.length}/{gameData.totalStickers}</span>
        </div>
        <button className="ar-close" onClick={onClose}>Fechar</button>
      </div>

      <div className="ar-mode-switch">
        <button className={mode === "marker" ? "active" : ""} onClick={() => setMode("marker")}>
          RA com MindAR
        </button>
        <button className={mode === "preview" ? "active" : ""} onClick={() => setMode("preview")}>
          Prévia do álbum
        </button>
      </div>

      {mode === "marker" ? (
        <div className="ar-standalone-layout">
          <aside className="ar-help-card ar-help-card-wide">
            <h2>RA com rastreamento de imagem usando MindAR</h2>
            <p>
              Esta versão substitui AR.js por MindAR. Em vez do marcador Hiro, a RA usa um alvo de imagem compilado
              em um arquivo <code>.mind</code>. O protótipo usa o alvo de exemplo do MindAR para funcionar imediatamente.
            </p>
            <ol>
              <li>Abra ou imprima o alvo MindAR do álbum.</li>
              <li>Clique em <strong>Abrir RA em tela cheia</strong>.</li>
              <li>Permita o uso da câmera, caso o navegador solicite.</li>
              <li>Aponte a câmera para a imagem inteira do alvo, mantendo boa iluminação.</li>
            </ol>
            <div className="ar-help-actions ar-help-actions-row">
              <a href="/mindar-target-print.html" target="_blank" rel="noreferrer">Abrir alvo MindAR</a>
              <a href={arUrl}>Abrir RA em tela cheia</a>
              <a href={arUrl} target="_blank" rel="noreferrer">Abrir RA em nova aba</a>
            </div>
            <p className="tiny-note">
              Para usar o álbum físico real como alvo, compile a arte do álbum no MindAR Image Targets Compiler,
              salve o arquivo como <code>frontend/public/markers/album.mind</code> e troque o valor de
              <code> imageTargetSrc </code> em <code>frontend/public/ar-album.html</code>.
            </p>
          </aside>

          <div className="ar-preview-card ar-preview-side">
            <h2>Prévia dos dados que serão exibidos em RA</h2>
            <AlbumVirtual team={team} stickers={gameData?.stickers || []} gameData={gameData} stickersById={stickersById} />
          </div>
        </div>
      ) : (
        <div className="ar-preview-card">
          <AlbumVirtual team={team} stickers={gameData?.stickers || []} gameData={gameData} stickersById={stickersById} />
        </div>
      )}
    </section>
  );
}

export default AlbumAR;

import { useEffect, useMemo, useState } from "react";
import { getGameData, getTeam, scanAlbum, scanSticker } from "./services/api";
import QRScanner from "./components/QRScanner";
import TeamRegistration from "./components/TeamRegistration";
import Dashboard from "./components/Dashboard";
import Quiz from "./components/Quiz";
import AlbumAR from "./components/AlbumAR";

const STORAGE_KEY = "qrcode-hunt-current-album";

function App() {
  const [screen, setScreen] = useState("loading");
  const [gameData, setGameData] = useState(null);
  const [team, setTeam] = useState(null);
  const [pendingAlbumId, setPendingAlbumId] = useState(null);
  const [quizPayload, setQuizPayload] = useState(null);
  const [message, setMessage] = useState("");

  const stickersById = useMemo(() => {
    const map = {};
    for (const sticker of gameData?.stickers || []) {
      map[sticker.stickerId] = sticker;
    }
    return map;
  }, [gameData]);

  useEffect(() => {
    async function boot() {
      try {
        const data = await getGameData();
        setGameData(data);

        const savedAlbumId = localStorage.getItem(STORAGE_KEY);
        if (savedAlbumId) {
          try {
            const response = await getTeam(savedAlbumId);
            setTeam(response.team);
            setScreen("dashboard");
            return;
          } catch {
            localStorage.removeItem(STORAGE_KEY);
          }
        }

        setScreen("welcome");
      } catch (err) {
        setMessage(err.message);
        setScreen("error");
      }
    }
    boot();
  }, []);

  function resetGameOnDevice() {
    localStorage.removeItem(STORAGE_KEY);
    setTeam(null);
    setPendingAlbumId(null);
    setQuizPayload(null);
    setMessage("");
    setScreen("welcome");
  }

  async function refreshTeam(albumId = team?.albumId) {
    if (!albumId) return;
    const response = await getTeam(albumId);
    setTeam(response.team);
  }

  async function handleAlbumQr(decodedText) {
    try {
      setMessage("Lendo álbum...");
      const response = await scanAlbum(decodedText);
      setMessage("");

      if (response.requiresRegistration) {
        setPendingAlbumId(response.albumId);
        setScreen("register");
        return;
      }

      setTeam(response.team);
      localStorage.setItem(STORAGE_KEY, response.team.albumId);
      setScreen("dashboard");
    } catch (err) {
      setMessage(err.message);
    }
  }

  function handleTeamCreated(createdTeam) {
    setTeam(createdTeam);
    localStorage.setItem(STORAGE_KEY, createdTeam.albumId);
    setScreen("dashboard");
  }

  async function handleStickerQr(decodedText) {
    if (!team) return;

    try {
      setMessage("Lendo figurinha...");
      const response = await scanSticker(team.albumId, decodedText);
      setMessage("");

      if (response.status === "already_collected") {
        setTeam(response.team);
        setMessage("Essa figurinha já está no álbum da equipe.");
        setScreen("dashboard");
        return;
      }

      if (response.status === "locked") {
        setQuizPayload({
          locked: true,
          sticker: response.sticker,
          retryAfterSeconds: response.retryAfterSeconds
        });
        setScreen("quiz");
        return;
      }

      setQuizPayload(response);
      setScreen("quiz");
    } catch (err) {
      setMessage(err.message);
    }
  }

  if (screen === "loading") {
    return <main className="app-shell center"><div className="card"><h1>Carregando...</h1></div></main>;
  }

  if (screen === "error") {
    return (
      <main className="app-shell center">
        <div className="card">
          <h1>Ops!</h1>
          <p>{message}</p>
          <p>Verifique se o back-end está rodando.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell">
      {screen === "welcome" && (
        <section className="hero card">
          <div className="badge">Jogo web com QR Code + RA</div>
          <h1>Caça-Figurinhas RA</h1>
          <p>
            Escaneie o QR code do álbum da equipe, procure as 5 figurinhas escondidas pela escola,
            responda às perguntas e complete o álbum mágico.
          </p>
          <button className="primary-button" onClick={() => setScreen("scanAlbum")}>Começar</button>
          <div className="tiny-note">
            Use os QR codes de exemplo listados no README ou gere os PNGs com o script do projeto.
          </div>
        </section>
      )}

      {screen === "scanAlbum" && (
        <section className="card">
          <button className="ghost-button" onClick={() => setScreen("welcome")}>← Voltar</button>
          <h1>Escaneie o álbum</h1>
          <p>Aponte a câmera para o QR code impresso no álbum físico da equipe.</p>
          {message && <div className="message">{message}</div>}
          <QRScanner onDetected={handleAlbumQr} />
        </section>
      )}

      {screen === "register" && (
        <TeamRegistration
          albumId={pendingAlbumId}
          onCreated={handleTeamCreated}
          onCancel={() => setScreen("scanAlbum")}
        />
      )}

      {screen === "dashboard" && team && gameData && (
        <Dashboard
          team={team}
          gameData={gameData}
          stickersById={stickersById}
          message={message}
          onMessage={setMessage}
          onScanSticker={() => {
            setMessage("");
            setScreen("scanSticker");
          }}
          onOpenAR={() => setScreen("albumAR")}
          onRefresh={() => refreshTeam()}
          onReset={resetGameOnDevice}
        />
      )}

      {screen === "scanSticker" && team && (
        <section className="card">
          <button className="ghost-button" onClick={() => setScreen("dashboard")}>← Voltar ao painel</button>
          <h1>Escaneie a figurinha</h1>
          <p>Aponte a câmera para o QR code da figurinha encontrada.</p>
          {message && <div className="message">{message}</div>}
          <QRScanner onDetected={handleStickerQr} />
        </section>
      )}

      {screen === "quiz" && team && quizPayload && (
        <Quiz
          team={team}
          quizPayload={quizPayload}
          onTeamUpdated={(updatedTeam) => setTeam(updatedTeam)}
          onBack={() => setScreen("dashboard")}
          onTryAgainScan={() => setScreen("scanSticker")}
        />
      )}

      {screen === "albumAR" && team && gameData && (
        <AlbumAR
          team={team}
          gameData={gameData}
          stickersById={stickersById}
          onClose={() => setScreen("dashboard")}
        />
      )}
    </main>
  );
}

export default App;

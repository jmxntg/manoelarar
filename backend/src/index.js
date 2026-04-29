require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const {
  ALBUMS,
  STICKERS,
  COMPLETION_BONUS,
  FIRST_COMPLETION_BONUS,
  findAlbumByQr,
  findStickerByQr,
  findStickerById,
  publicSticker,
  publicQuestion
} = require("./gameData");

const {
  initDb,
  getTeam,
  createTeam,
  updateTeamProgress,
  insertAttempt,
  getLock,
  setLock,
  clearLock,
  countCompletedTeams,
  getRanking
} = require("./database");

const PORT = Number(process.env.PORT || 3001);
const FRONTEND_URL = process.env.FRONTEND_URL || "https://qrcode-hunt-ar-frontend.onrender.com";
const CORS_ORIGIN = process.env.CORS_ORIGIN || FRONTEND_URL || "http://localhost:5173";
const LOCK_SECONDS = 10;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

function validateTeamName(teamName) {
  const name = String(teamName || "").trim();
  if (name.length < 2) return { ok: false, message: "O nome da equipe deve ter pelo menos 2 caracteres." };
  if (name.length > 30) return { ok: false, message: "O nome da equipe deve ter no máximo 30 caracteres." };
  return { ok: true, name };
}

function getRetryAfterSeconds(lockedUntil) {
  const remainingMs = Math.max(0, lockedUntil - Date.now());
  return Math.ceil(remainingMs / 1000);
}

async function emitRanking() {
  const ranking = await getRanking();
  io.emit("ranking:update", ranking);
  return ranking;
}

io.on("connection", async (socket) => {
  socket.emit("ranking:update", await getRanking());
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, name: "Caça-Figurinhas RA API" });
});

app.get("/api/game-data", (_req, res) => {
  res.json({
    totalStickers: STICKERS.length,
    completionBonus: COMPLETION_BONUS,
    firstCompletionBonus: FIRST_COMPLETION_BONUS,
    stickers: STICKERS.map(publicSticker),
    albumQrExamples: ALBUMS
  });
});

app.post("/api/albums/scan", async (req, res) => {
  const { qrValue } = req.body;
  const album = findAlbumByQr(qrValue);

  if (!album) {
    return res.status(404).json({
      error: "ALBUM_NOT_FOUND",
      message: "Este QR code não corresponde a um álbum válido do jogo."
    });
  }

  const team = await getTeam(album.albumId);
  res.json({
    albumId: album.albumId,
    requiresRegistration: !team,
    team
  });
});

app.post("/api/teams", async (req, res) => {
  const { albumId, teamName } = req.body;
  const album = ALBUMS.find((candidate) => candidate.albumId === albumId);

  if (!album) {
    return res.status(404).json({
      error: "ALBUM_NOT_FOUND",
      message: "Álbum não encontrado. Escaneie novamente o QR code do álbum."
    });
  }

  const validation = validateTeamName(teamName);
  if (!validation.ok) {
    return res.status(400).json({ error: "INVALID_TEAM_NAME", message: validation.message });
  }

  const existingTeam = await getTeam(albumId);
  if (existingTeam) {
    return res.json({ team: existingTeam, alreadyExists: true });
  }

  const team = await createTeam(albumId, validation.name);
  await emitRanking();
  res.status(201).json({ team, alreadyExists: false });
});

app.get("/api/teams/:albumId", async (req, res) => {
  const team = await getTeam(req.params.albumId);
  if (!team) {
    return res.status(404).json({ error: "TEAM_NOT_FOUND", message: "Equipe não encontrada." });
  }
  res.json({ team });
});

app.get("/api/ranking", async (_req, res) => {
  res.json({ ranking: await getRanking() });
});

app.post("/api/stickers/scan", async (req, res) => {
  const { albumId, qrValue } = req.body;
  const team = await getTeam(albumId);

  if (!team) {
    return res.status(404).json({ error: "TEAM_NOT_FOUND", message: "Equipe não encontrada." });
  }

  const sticker = findStickerByQr(qrValue);
  if (!sticker) {
    return res.status(404).json({
      error: "STICKER_NOT_FOUND",
      message: "Este QR code não corresponde a uma figurinha válida."
    });
  }

  if (team.collectedStickers.includes(sticker.stickerId)) {
    return res.json({
      status: "already_collected",
      message: "Essa figurinha já está no álbum da equipe.",
      sticker: publicSticker(sticker),
      team
    });
  }

  const lock = await getLock(albumId, sticker.stickerId);
  if (lock && lock.locked_until > Date.now()) {
    return res.json({
      status: "locked",
      message: "A equipe precisa aguardar antes de tentar novamente.",
      retryAfterSeconds: getRetryAfterSeconds(lock.locked_until),
      sticker: publicSticker(sticker)
    });
  }

  res.json({
    status: "question",
    sticker: publicSticker(sticker),
    question: publicQuestion(sticker)
  });
});

app.post("/api/answers", async (req, res) => {
  const { albumId, stickerId, selectedIndex } = req.body;
  const team = await getTeam(albumId);

  if (!team) {
    return res.status(404).json({ error: "TEAM_NOT_FOUND", message: "Equipe não encontrada." });
  }

  const sticker = findStickerById(stickerId);
  if (!sticker) {
    return res.status(404).json({ error: "STICKER_NOT_FOUND", message: "Figurinha não encontrada." });
  }

  if (team.collectedStickers.includes(stickerId)) {
    return res.json({
      status: "already_collected",
      message: "Essa figurinha já foi coletada.",
      team
    });
  }

  const lock = await getLock(albumId, stickerId);
  if (lock && lock.locked_until > Date.now()) {
    return res.json({
      status: "locked",
      message: "Aguarde antes de tentar novamente.",
      retryAfterSeconds: getRetryAfterSeconds(lock.locked_until)
    });
  }

  const answerIndex = Number(selectedIndex);
  const isCorrect = answerIndex === sticker.question.correctIndex;
  await insertAttempt(albumId, stickerId, answerIndex, isCorrect);

  if (!isCorrect) {
    const lockedUntil = Date.now() + LOCK_SECONDS * 1000;
    await setLock(albumId, stickerId, lockedUntil);
    return res.json({
      status: "wrong",
      correct: false,
      message: `Quase lá! Tente novamente em ${LOCK_SECONDS} segundos.`,
      retryAfterSeconds: LOCK_SECONDS,
      lockedUntil
    });
  }

  await clearLock(albumId, stickerId);

  const collectedStickers = [...team.collectedStickers, stickerId];
  let scoreDelta = sticker.points;
  const bonuses = [];
  let completedAt = null;

  if (collectedStickers.length === STICKERS.length && !team.completedAt) {
    completedAt = new Date().toISOString();
    scoreDelta += COMPLETION_BONUS;
    bonuses.push({ name: "Álbum completo", points: COMPLETION_BONUS });

    const completedBefore = await countCompletedTeams();
    if (completedBefore === 0) {
      scoreDelta += FIRST_COMPLETION_BONUS;
      bonuses.push({ name: "Primeira equipe a completar", points: FIRST_COMPLETION_BONUS });
    }
  }

  const updatedTeam = await updateTeamProgress(
    albumId,
    team.score + scoreDelta,
    collectedStickers,
    completedAt
  );

  await emitRanking();

  res.json({
    status: "correct",
    correct: true,
    message: "Resposta correta! Figurinha adicionada ao álbum.",
    sticker: publicSticker(sticker),
    scoreDelta,
    bonuses,
    team: updatedTeam
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    error: "INTERNAL_ERROR",
    message: "Ocorreu um erro inesperado no servidor."
  });
});

initDb()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Caça-Figurinhas RA API rodando na porta ${PORT}`);
      console.log(`CORS liberado para: ${CORS_ORIGIN}`);
    });
  })
  .catch((err) => {
    console.error("Erro ao iniciar banco de dados", err);
    process.exit(1);
  });

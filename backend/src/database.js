const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const defaultDataDir = path.join(__dirname, "..", "data");
const dbPath = process.env.DATABASE_PATH || path.join(defaultDataDir, "game.sqlite");
const dataDir = path.dirname(dbPath);
fs.mkdirSync(dataDir, { recursive: true });
const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function initDb() {
  await run(`
    CREATE TABLE IF NOT EXISTS teams (
      album_id TEXT PRIMARY KEY,
      team_name TEXT NOT NULL,
      score INTEGER NOT NULL DEFAULT 0,
      collected_stickers TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      completed_at TEXT
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      album_id TEXT NOT NULL,
      sticker_id TEXT NOT NULL,
      selected_index INTEGER NOT NULL,
      is_correct INTEGER NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS locks (
      album_id TEXT NOT NULL,
      sticker_id TEXT NOT NULL,
      locked_until INTEGER NOT NULL,
      PRIMARY KEY (album_id, sticker_id)
    )
  `);
}

function normalizeTeam(row) {
  if (!row) return null;
  let collected = [];
  try {
    collected = JSON.parse(row.collected_stickers || "[]");
  } catch {
    collected = [];
  }

  return {
    albumId: row.album_id,
    teamName: row.team_name,
    score: row.score,
    collectedStickers: collected,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at
  };
}

async function getTeam(albumId) {
  const row = await get("SELECT * FROM teams WHERE album_id = ?", [albumId]);
  return normalizeTeam(row);
}

async function getAllTeams() {
  const rows = await all("SELECT * FROM teams", []);
  return rows.map(normalizeTeam);
}

async function createTeam(albumId, teamName) {
  const now = new Date().toISOString();
  await run(
    `INSERT INTO teams (album_id, team_name, score, collected_stickers, created_at, updated_at)
     VALUES (?, ?, 0, '[]', ?, ?)`,
    [albumId, teamName, now, now]
  );
  return getTeam(albumId);
}

async function updateTeamProgress(albumId, score, collectedStickers, completedAt = null) {
  const now = new Date().toISOString();
  await run(
    `UPDATE teams
     SET score = ?, collected_stickers = ?, completed_at = COALESCE(completed_at, ?), updated_at = ?
     WHERE album_id = ?`,
    [score, JSON.stringify(collectedStickers), completedAt, now, albumId]
  );
  return getTeam(albumId);
}

async function insertAttempt(albumId, stickerId, selectedIndex, isCorrect) {
  await run(
    `INSERT INTO attempts (album_id, sticker_id, selected_index, is_correct, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [albumId, stickerId, selectedIndex, isCorrect ? 1 : 0, new Date().toISOString()]
  );
}

async function getLock(albumId, stickerId) {
  return get("SELECT * FROM locks WHERE album_id = ? AND sticker_id = ?", [albumId, stickerId]);
}

async function setLock(albumId, stickerId, lockedUntil) {
  await run(
    `INSERT INTO locks (album_id, sticker_id, locked_until)
     VALUES (?, ?, ?)
     ON CONFLICT(album_id, sticker_id)
     DO UPDATE SET locked_until = excluded.locked_until`,
    [albumId, stickerId, lockedUntil]
  );
}

async function clearLock(albumId, stickerId) {
  await run("DELETE FROM locks WHERE album_id = ? AND sticker_id = ?", [albumId, stickerId]);
}

async function countCompletedTeams() {
  const row = await get("SELECT COUNT(*) AS total FROM teams WHERE completed_at IS NOT NULL", []);
  return row ? row.total : 0;
}

async function getRanking() {
  const teams = await getAllTeams();
  return teams
    .map((team) => ({
      ...team,
      collectedCount: team.collectedStickers.length
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.collectedCount !== a.collectedCount) return b.collectedCount - a.collectedCount;
      if (a.completedAt && b.completedAt) return new Date(a.completedAt) - new Date(b.completedAt);
      if (a.completedAt && !b.completedAt) return -1;
      if (!a.completedAt && b.completedAt) return 1;
      return new Date(a.createdAt) - new Date(b.createdAt);
    })
    .map((team, index) => ({
      position: index + 1,
      albumId: team.albumId,
      teamName: team.teamName,
      score: team.score,
      collectedCount: team.collectedCount,
      totalStickers: 5,
      completedAt: team.completedAt
    }));
}

module.exports = {
  initDb,
  getTeam,
  getAllTeams,
  createTeam,
  updateTeamProgress,
  insertAttempt,
  getLock,
  setLock,
  clearLock,
  countCompletedTeams,
  getRanking
};

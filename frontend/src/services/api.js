export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_URL;

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload.message || "Erro de comunicação com o servidor.";
    throw new Error(message);
  }

  return payload;
}

export function getGameData() {
  return request("/api/game-data");
}

export function scanAlbum(qrValue) {
  return request("/api/albums/scan", {
    method: "POST",
    body: JSON.stringify({ qrValue })
  });
}

export function createTeam(albumId, teamName) {
  return request("/api/teams", {
    method: "POST",
    body: JSON.stringify({ albumId, teamName })
  });
}

export function getTeam(albumId) {
  return request(`/api/teams/${encodeURIComponent(albumId)}`);
}

export function scanSticker(albumId, qrValue) {
  return request("/api/stickers/scan", {
    method: "POST",
    body: JSON.stringify({ albumId, qrValue })
  });
}

export function submitAnswer(albumId, stickerId, selectedIndex) {
  return request("/api/answers", {
    method: "POST",
    body: JSON.stringify({ albumId, stickerId, selectedIndex })
  });
}

export function getRanking() {
  return request("/api/ranking");
}

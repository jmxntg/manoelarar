const COMPLETION_BONUS = 200;
const FIRST_COMPLETION_BONUS = 300;

const ALBUMS = [
  { albumId: "ALBUM001", qrValue: "ALBUM:ALBUM001:SEC-7A9" },
  { albumId: "ALBUM002", qrValue: "ALBUM:ALBUM002:SEC-K3P" },
  { albumId: "ALBUM003", qrValue: "ALBUM:ALBUM003:SEC-Q81" },
  { albumId: "ALBUM004", qrValue: "ALBUM:ALBUM004:SEC-Z44" },
  { albumId: "ALBUM005", qrValue: "ALBUM:ALBUM005:SEC-B77" },
  { albumId: "ALBUM006", qrValue: "ALBUM:ALBUM006:SEC-M10" }
];

const STICKERS = [
  {
    stickerId: "FIG01",
    name: "Direito à Educação",
    qrValue: "GAME2026-FIG01-X92K7M",
    imageUrl: "/stickers/fig01.jpg",
    points: 100,
    question: {
      text: "O que a escola ajuda as crianças a aprender?",
      options: ["Brigar com os colegas", "Ler e aprender coisas novas", "Ficar sem brincar", "Dormir o dia inteiro"],
      correctIndex: 1
    }
  },
  {
    stickerId: "FIG02",
    name: "Direito à Brincadeira",
    qrValue: "GAME2026-FIG02-P31Q8A",
    imageUrl: "/stickers/fig02.jpg",
    points: 100,
    question: {
      text: "Brincar é importante porque ajuda a criança a:",
      options: [
        "Ficar triste",
        "Aprender, imaginar e se divertir",
        "Brigar mais",
        "Não falar com ninguém"
      ],
      correctIndex: 1
    }
  },
  {
    stickerId: "FIG03",
    name: "Direito à Proteção",
    qrValue: "GAME2026-FIG03-L55N2C",
    imageUrl: "/stickers/fig03.jpg",
    points: 100,
    question: {
      text: "Se uma criança estiver triste ou em perigo, o que devemos fazer?",
      options: ["Ignorar", "Rir da situação", "Procurar um adulto de confiança", "Sair correndo sozinho"],
      correctIndex: 2
    }
  },
  {
    stickerId: "FIG04",
    name: "Direito à Família",
    qrValue: "GAME2026-FIG04-R70T1B",
    imageUrl: "/stickers/fig04.jpg",
    points: 100,
    question: {
      text: "Quem pode cuidar das crianças?",
      options: [
        "Família e responsáveis",
        "Apenas desconhecidos",
        "Ninguém",
        "Só personagens de desenho"
      ],
      correctIndex: 0
    }
  },
  {
    stickerId: "FIG05",
    name: "Direito ao Respeito",
    qrValue: "GAME2026-FIG05-H16V9D",
    imageUrl: "/stickers/fig05.jpg",
    points: 100,
    question: {
      text: "O que significa respeitar as outras pessoas?",
      options: ["Xingar os colegas",
      "Empurrar na fila",
      "Fazer bullying",
      "Ouvir, ajudar e tratar bem"],
      correctIndex: 3
    }
  }
];

function findAlbumByQr(qrValue) {
  return ALBUMS.find((album) => album.qrValue === String(qrValue || "").trim());
}

function findStickerByQr(qrValue) {
  return STICKERS.find((sticker) => sticker.qrValue === String(qrValue || "").trim());
}

function findStickerById(stickerId) {
  return STICKERS.find((sticker) => sticker.stickerId === stickerId);
}

function publicSticker(sticker) {
  return {
    stickerId: sticker.stickerId,
    name: sticker.name,
    imageUrl: sticker.imageUrl,
    points: sticker.points
  };
}

function publicQuestion(sticker) {
  return {
    stickerId: sticker.stickerId,
    text: sticker.question.text,
    options: sticker.question.options
  };
}

module.exports = {
  ALBUMS,
  STICKERS,
  COMPLETION_BONUS,
  FIRST_COMPLETION_BONUS,
  findAlbumByQr,
  findStickerByQr,
  findStickerById,
  publicSticker,
  publicQuestion
};

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
    name: "Guardião da Árvore",
    qrValue: "GAME2026-FIG01-X92K7M",
    imageUrl: "/stickers/fig01.svg",
    points: 100,
    question: {
      text: "Qual destes elementos ajuda uma planta a produzir seu próprio alimento?",
      options: ["Areia", "Luz do sol", "Plástico", "Vidro"],
      correctIndex: 1
    }
  },
  {
    stickerId: "FIG02",
    name: "Explorador da Água",
    qrValue: "GAME2026-FIG02-P31Q8A",
    imageUrl: "/stickers/fig02.svg",
    points: 100,
    question: {
      text: "Qual atitude ajuda a economizar água?",
      options: [
        "Deixar a torneira aberta",
        "Tomar banhos muito longos",
        "Fechar a torneira ao escovar os dentes",
        "Lavar a calçada todos os dias"
      ],
      correctIndex: 2
    }
  },
  {
    stickerId: "FIG03",
    name: "Mestre da Reciclagem",
    qrValue: "GAME2026-FIG03-L55N2C",
    imageUrl: "/stickers/fig03.svg",
    points: 100,
    question: {
      text: "Qual destes materiais pode ser reciclado?",
      options: ["Garrafa PET", "Restos de comida", "Guardanapo sujo", "Chiclete"],
      correctIndex: 0
    }
  },
  {
    stickerId: "FIG04",
    name: "Protetor dos Animais",
    qrValue: "GAME2026-FIG04-R70T1B",
    imageUrl: "/stickers/fig04.svg",
    points: 100,
    question: {
      text: "O que devemos fazer ao encontrar um animal precisando de ajuda?",
      options: [
        "Ignorar",
        "Pedir ajuda a um adulto responsável",
        "Assustar o animal",
        "Levar para qualquer lugar sem cuidado"
      ],
      correctIndex: 1
    }
  },
  {
    stickerId: "FIG05",
    name: "Cientista Curioso",
    qrValue: "GAME2026-FIG05-H16V9D",
    imageUrl: "/stickers/fig05.svg",
    points: 100,
    question: {
      text: "Qual atitude é importante em uma investigação científica?",
      options: ["Observar com atenção", "Inventar resultados", "Não fazer perguntas", "Copiar sem entender"],
      correctIndex: 0
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

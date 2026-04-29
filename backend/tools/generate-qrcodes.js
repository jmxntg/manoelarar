const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");
const { ALBUMS, STICKERS } = require("../src/gameData");

const outDir = path.join(__dirname, "..", "printables", "qrcodes");
fs.mkdirSync(outDir, { recursive: true });

async function writeQr(filename, value) {
  const filepath = path.join(outDir, filename);
  await QRCode.toFile(filepath, value, {
    type: "png",
    width: 800,
    margin: 2,
    errorCorrectionLevel: "H"
  });
  console.log(`Criado: ${filepath} -> ${value}`);
}

async function main() {
  for (const album of ALBUMS) {
    await writeQr(`album-${album.albumId}.png`, album.qrValue);
  }

  for (const sticker of STICKERS) {
    await writeQr(`sticker-${sticker.stickerId}.png`, sticker.qrValue);
  }

  const manifest = {
    albums: ALBUMS,
    stickers: STICKERS.map((sticker) => ({
      stickerId: sticker.stickerId,
      name: sticker.name,
      qrValue: sticker.qrValue
    }))
  };
  fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log("QR codes gerados com sucesso.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

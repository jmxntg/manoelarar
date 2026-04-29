function AlbumVirtual({ team = {}, stickers, gameData, stickersById }) {
  const collectedStickers = Array.isArray(team.collectedStickers) ? team.collectedStickers : [];
  const collected = new Set(collectedStickers);

  const stickerList = Array.isArray(stickers)
    ? stickers
    : Array.isArray(gameData?.stickers)
      ? gameData.stickers
      : stickersById && typeof stickersById === "object"
        ? Object.values(stickersById)
        : [];

  if (stickerList.length === 0) {
    return (
      <div className="album-card">
        <div className="album-title">Álbum virtual</div>
        <p className="tiny-note">
          Nenhuma figurinha foi carregada ainda. Verifique se o back-end está rodando e se os dados do jogo foram recebidos.
        </p>
      </div>
    );
  }

  return (
    <div className="album-card">
      <div className="album-title">Álbum virtual</div>
      <div className="album-grid">
        {stickerList.map((sticker, index) => {
          const hasSticker = collected.has(sticker.stickerId);
          return (
            <div key={sticker.stickerId} className={`album-slot ${hasSticker ? "filled" : "empty"}`}>
              {hasSticker ? (
                <>
                  <img src={sticker.imageUrl} alt={sticker.name} />
                  <span>{sticker.name}</span>
                </>
              ) : (
                <>
                  <div className="slot-number">{index + 1}</div>
                  <span>Espaço vazio</span>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AlbumVirtual;

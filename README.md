# Caça-Figurinhas RA — QR Code Hunt Infantil

Projeto completo de MVP para um jogo infantil web baseado em QR codes, perguntas, álbum virtual e modo de realidade aumentada com rastreamento de imagem.

## O que está incluído

- Front-end React + Vite.
- Back-end Node.js + Express.
- Ranking em tempo real com Socket.IO.
- Persistência em SQLite.
- Leitura de QR codes pela câmera com `html5-qrcode`.
- Cadastro de equipes pelo QR code do álbum.
- Validação de 5 figurinhas.
- Perguntas com 4 alternativas.
- Bloqueio de 10 segundos após resposta errada.
- Pontuação e ranking.
- Álbum virtual.
- Modo RA com MindAR + A-Frame usando image tracking.
- Página para imprimir/abrir o alvo MindAR em `frontend/public/mindar-target-print.html`.
- Página de RA em `frontend/public/ar-album.html`.
- Modo de prévia do álbum virtual, sem câmera, para conferência rápida.
- Script para gerar QR codes de impressão.

## Requisitos

- Node.js 18 ou superior.
- Navegador moderno.
- Para usar câmera no celular, abra em `https` ou em `localhost`. Navegadores exigem contexto seguro para câmera.
- Conexão com a internet para carregar MindAR/A-Frame via CDN na versão atual.

## Instalação

Em dois terminais diferentes:

### Terminal 1 — Back-end

```bash
cd backend
npm install
npm run dev
```

O servidor ficará em:

```text
http://localhost:3001
```

### Terminal 2 — Front-end

```bash
cd frontend
npm install
npm run dev
```

O jogo ficará em:

```text
http://localhost:5173
```

## Gerar QR codes para impressão

No back-end:

```bash
cd backend
npm run generate:qrcodes
```

Os PNGs serão salvos em:

```text
backend/printables/qrcodes
```

## QR codes de exemplo

### Álbuns

Use um QR code por equipe/álbum:

```text
ALBUM:ALBUM001:SEC-7A9
ALBUM:ALBUM002:SEC-K3P
ALBUM:ALBUM003:SEC-Q81
ALBUM:ALBUM004:SEC-Z44
ALBUM:ALBUM005:SEC-B77
ALBUM:ALBUM006:SEC-M10
```

### Figurinhas

Imprima uma figurinha para cada QR code:

```text
GAME2026-FIG01-X92K7M
GAME2026-FIG02-P31Q8A
GAME2026-FIG03-L55N2C
GAME2026-FIG04-R70T1B
GAME2026-FIG05-H16V9D
```

## Fluxo do jogo

1. A equipe abre o jogo.
2. Escaneia o QR code do álbum.
3. Informa o nome da equipe.
4. Procura as figurinhas escondidas na escola.
5. Escaneia o QR code de uma figurinha.
6. Responde a pergunta.
7. Se acertar, a figurinha entra no álbum virtual e a equipe ganha pontos.
8. Se errar, precisa aguardar 10 segundos.
9. O ranking é atualizado em tempo real.

## Como testar a realidade aumentada com MindAR

O modo de RA agora usa MindAR com rastreamento de imagem. A câmera sozinha não exibe objetos virtuais; o álbum aparece apenas quando a imagem-alvo compilada no arquivo `.mind` é detectada.

Nesta versão, para funcionar imediatamente, o protótipo usa o alvo de exemplo oficial do MindAR:

```text
https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/card.mind
```

Passos:

1. Cadastre uma equipe escaneando um QR code de álbum.
2. Colete pelo menos uma figurinha, ou use a prévia com espaços vazios.
3. No painel da equipe, clique em **Ver álbum em RA**.
4. Clique em **Abrir alvo MindAR**.
5. Imprima o alvo ou abra-o em outro celular/notebook.
6. Clique em **Abrir RA em tela cheia**.
7. Permita o uso da câmera.
8. Aponte a câmera para a imagem inteira do alvo, mantendo boa iluminação.

Se a câmera piscar e sumir, abra diretamente esta URL no navegador, sem iframe:

```text
http://localhost:5173/ar-album.html
```

Arquivos relacionados:

```text
frontend/public/ar-album.html
frontend/public/mindar-target-print.html
```

## Como usar o álbum físico real como alvo MindAR

Para produção, substitua o alvo de exemplo pela arte real do álbum físico.

1. Gere uma imagem final do álbum ou do marcador visual do álbum, por exemplo `album-target.png`.
2. Abra o MindAR Image Targets Compiler.
3. Envie `album-target.png`.
4. Clique em `Start`.
5. Baixe o arquivo `.mind` gerado.
6. Salve como:

```text
frontend/public/markers/album.mind
```

7. Em `frontend/public/ar-album.html`, substitua:

```html
mindar-image="imageTargetSrc: https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/card.mind; ..."
```

por:

```html
mindar-image="imageTargetSrc: /markers/album.mind; autoStart: true; uiLoading: yes; uiScanning: yes; uiError: yes;"
```

8. Atualize `frontend/public/mindar-target-print.html` para imprimir a mesma imagem usada na compilação.

Dicas para um bom alvo MindAR:

- use imagem com bastante contraste;
- evite grandes áreas lisas ou repetitivas;
- mantenha o alvo plano durante o uso;
- use boa iluminação;
- garanta que a imagem impressa seja a mesma usada para gerar o `.mind`.

## Estrutura

```text
qrcode-hunt-ar-game
├── backend
│   ├── src
│   │   ├── database.js
│   │   ├── gameData.js
│   │   └── index.js
│   ├── tools
│   │   └── generate-qrcodes.js
│   ├── data
│   │   └── game.sqlite  # criado automaticamente
│   └── package.json
└── frontend
    ├── src
    │   ├── components
    │   │   ├── AlbumAR.jsx
    │   │   ├── AlbumVirtual.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── QRScanner.jsx
    │   │   ├── Quiz.jsx
    │   │   ├── Ranking.jsx
    │   │   └── TeamRegistration.jsx
    │   ├── services
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── styles.css
    ├── public
    │   ├── ar-album.html
    │   ├── mindar-target-print.html
    │   ├── markers
    │   └── stickers
    │       ├── fig01.svg
    │       ├── fig02.svg
    │       ├── fig03.svg
    │       ├── fig04.svg
    │       └── fig05.svg
    └── package.json
```

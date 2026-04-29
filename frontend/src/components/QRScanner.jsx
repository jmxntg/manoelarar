import { useEffect, useMemo, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

function QRScanner({ onDetected }) {
  const elementId = useMemo(() => `qr-reader-${Math.random().toString(36).slice(2)}`, []);
  const scannerRef = useRef(null);
  const onDetectedRef = useRef(onDetected);
  const detectedRef = useRef(false);
  const stoppingRef = useRef(false);
  const startedRef = useRef(false);
  const [error, setError] = useState("");
  const [isStarting, setIsStarting] = useState(true);

  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  useEffect(() => {
    let cancelled = false;

    async function safeStopAndClear(scanner) {
      if (!scanner || stoppingRef.current) return;
      stoppingRef.current = true;

      try {
        if (startedRef.current) {
          await scanner.stop();
        }
      } catch (err) {
        // html5-qrcode throws when stop() is called before the camera is fully running,
        // after it has already stopped, or during React remounts in development.
        console.debug("QR scanner stop ignored:", err?.message || err);
      }

      try {
        await scanner.clear();
      } catch (err) {
        console.debug("QR scanner clear ignored:", err?.message || err);
      } finally {
        startedRef.current = false;
        stoppingRef.current = false;
      }
    }

    async function startScanner(scanner, cameraConfig, config, onSuccess) {
      await scanner.start(cameraConfig, config, onSuccess, () => {});
      startedRef.current = true;
    }

    async function getFallbackCameraId() {
      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        throw new Error("Nenhuma câmera foi encontrada neste dispositivo.");
      }

      // Prefer a rear/environment camera when the browser exposes labels.
      const rearCamera = cameras.find((camera) =>
        /back|rear|environment|traseira|posterior/i.test(camera.label || "")
      );

      return rearCamera?.id || cameras[0].id;
    }

    async function start() {
      const scanner = new Html5Qrcode(elementId);
      scannerRef.current = scanner;
      detectedRef.current = false;
      startedRef.current = false;
      setError("");
      setIsStarting(true);

      const config = {
        fps: 10,
        qrbox: { width: 260, height: 260 },
        aspectRatio: 1.333
      };

      const onSuccess = async (decodedText) => {
        if (detectedRef.current) return;
        detectedRef.current = true;

        const cleanText = String(decodedText || "").trim();
        await safeStopAndClear(scanner);

        if (!cancelled && cleanText) {
          onDetectedRef.current(cleanText);
        }
      };

      try {
        // html5-qrcode validates facingMode strictly. It accepts a string or
        // an object with `exact`, but not `{ ideal: "environment" }`.
        try {
          await startScanner(scanner, { facingMode: { exact: "environment" } }, config, onSuccess);
        } catch (rearCameraError) {
          console.debug("Rear camera constraint failed, trying default camera:", rearCameraError?.message || rearCameraError);

          if (cancelled) return;

          try {
            await startScanner(scanner, { facingMode: "environment" }, config, onSuccess);
          } catch (facingModeError) {
            console.debug("facingMode string failed, trying camera id fallback:", facingModeError?.message || facingModeError);

            if (cancelled) return;

            const cameraId = await getFallbackCameraId();
            await startScanner(scanner, cameraId, config, onSuccess);
          }
        }

        if (cancelled) {
          await safeStopAndClear(scanner);
          return;
        }

        setIsStarting(false);
      } catch (err) {
        if (cancelled) return;

        console.error("QR scanner start failed:", err);
        setError(
          "Não foi possível iniciar a câmera. Verifique se o navegador tem permissão de câmera, se nenhuma outra aba está usando a câmera e se você está usando localhost ou HTTPS."
        );
        setIsStarting(false);
      }
    }

    start();

    return () => {
      cancelled = true;
      const scanner = scannerRef.current;
      scannerRef.current = null;
      safeStopAndClear(scanner);
    };
  }, [elementId]);

  return (
    <div className="scanner-shell">
      {isStarting && <div className="scanner-loading">Iniciando câmera...</div>}
      {error && <div className="error-box">{error}</div>}
      <div id={elementId} className="qr-reader" />
    </div>
  );
}

export default QRScanner;

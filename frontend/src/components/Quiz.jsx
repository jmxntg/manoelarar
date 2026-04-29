import { useEffect, useState } from "react";
import { submitAnswer } from "../services/api";

function Quiz({ team, quizPayload, onTeamUpdated, onBack, onTryAgainScan }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryAfter, setRetryAfter] = useState(quizPayload.retryAfterSeconds || 0);
  const [finished, setFinished] = useState(false);

  const sticker = quizPayload.sticker;
  const question = quizPayload.question;
  const isLockedInitially = quizPayload.locked;
  const isLocked = retryAfter > 0;

  useEffect(() => {
    if (retryAfter <= 0) return;
    const timer = setInterval(() => {
      setRetryAfter((value) => Math.max(0, value - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [retryAfter]);

  async function handleSubmit() {
    if (selectedIndex === null || isSubmitting || isLocked || !question) return;

    setIsSubmitting(true);
    setFeedback("");

    try {
      const response = await submitAnswer(team.albumId, question.stickerId, selectedIndex);

      if (response.status === "correct") {
        onTeamUpdated(response.team);
        const bonusText = response.bonuses?.length
          ? ` Bônus: ${response.bonuses.map((bonus) => `${bonus.name} (+${bonus.points})`).join(", ")}.`
          : "";
        setFeedback(`${response.message} +${response.scoreDelta} pontos.${bonusText}`);
        setFinished(true);
        return;
      }

      if (response.status === "wrong") {
        setFeedback(response.message);
        setRetryAfter(response.retryAfterSeconds || 10);
        setSelectedIndex(null);
        return;
      }

      if (response.status === "locked") {
        setFeedback(response.message);
        setRetryAfter(response.retryAfterSeconds || 10);
        return;
      }

      if (response.status === "already_collected") {
        onTeamUpdated(response.team);
        setFeedback(response.message);
        setFinished(true);
      }
    } catch (err) {
      setFeedback(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLockedInitially && !question) {
    return (
      <section className="card narrow-card">
        <button className="ghost-button" onClick={onBack}>← Voltar ao painel</button>
        <h1>{sticker?.name || "Figurinha"}</h1>
        <div className="warning-box">
          Aguarde {retryAfter} segundo{retryAfter === 1 ? "" : "s"} para tentar novamente.
        </div>
        <button className="primary-button" disabled={isLocked} onClick={onTryAgainScan}>
          {isLocked ? "Aguardando..." : "Escanear novamente"}
        </button>
      </section>
    );
  }

  return (
    <section className="card narrow-card">
      <button className="ghost-button" onClick={onBack}>← Voltar ao painel</button>
      <div className="quiz-sticker">
        {sticker?.imageUrl && <img src={sticker.imageUrl} alt={sticker.name} />}
        <div>
          <div className="badge">Figurinha encontrada</div>
          <h1>{sticker?.name}</h1>
        </div>
      </div>

      {question && (
        <>
          <h2>{question.text}</h2>
          <div className="options-grid">
            {question.options.map((option, index) => (
              <button
                key={option}
                className={`option-button ${selectedIndex === index ? "selected" : ""}`}
                onClick={() => setSelectedIndex(index)}
                disabled={isSubmitting || isLocked || finished}
              >
                <strong>{String.fromCharCode(65 + index)}</strong>
                <span>{option}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {feedback && (
        <div className={finished ? "success-box" : "warning-box"}>{feedback}</div>
      )}

      {isLocked && !finished && (
        <div className="countdown-box">
          Nova tentativa em {retryAfter} segundo{retryAfter === 1 ? "" : "s"}.
        </div>
      )}

      <div className="button-row">
        {!finished ? (
          <button
            className="primary-button"
            disabled={selectedIndex === null || isSubmitting || isLocked}
            onClick={handleSubmit}
          >
            {isSubmitting ? "Enviando..." : "Responder"}
          </button>
        ) : (
          <button className="primary-button" onClick={onBack}>Voltar ao painel</button>
        )}
      </div>
    </section>
  );
}

export default Quiz;

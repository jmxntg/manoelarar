import { useState } from "react";
import { createTeam } from "../services/api";

function TeamRegistration({ albumId, onCreated, onCancel }) {
  const [teamName, setTeamName] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      const response = await createTeam(albumId, teamName);
      onCreated(response.team);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="card narrow-card">
      <button className="ghost-button" onClick={onCancel}>← Escanear outro álbum</button>
      <h1>Nome da equipe</h1>
      <p>Álbum identificado: <strong>{albumId}</strong></p>
      <form onSubmit={handleSubmit} className="form-stack">
        <label>
          Como a equipe vai se chamar?
          <input
            type="text"
            value={teamName}
            minLength={2}
            maxLength={30}
            onChange={(event) => setTeamName(event.target.value)}
            placeholder="Ex.: Os Exploradores"
            autoFocus
          />
        </label>
        {message && <div className="error-box">{message}</div>}
        <button className="primary-button" type="submit" disabled={isSaving}>
          {isSaving ? "Salvando..." : "Salvar equipe"}
        </button>
      </form>
    </section>
  );
}

export default TeamRegistration;

/**
 * Valorant Tracker (round review)
 *
 * Supports:
 * - importing a match JSON with rounds[]
 * - mock match loading for demo
 * - saving per-round mistake notes to Firestore (per user)
 */

class ValorantTracker {
  constructor() {
    this.api = new ValorantAPI();
    this.currentUser = null;
    this.match = null;
    this.roundIndex = 0;

    this.els = {
      riotId: document.getElementById("riot-id"),
      file: document.getElementById("match-json"),
      loadMock: document.getElementById("load-mock-btn"),
      prev: document.getElementById("prev-round"),
      next: document.getElementById("next-round"),
      indicator: document.getElementById("round-indicator"),
      summary: document.getElementById("round-summary"),
      kills: document.getElementById("round-kills"),
      damage: document.getElementById("round-damage"),
      notes: document.getElementById("mistake-notes"),
      saveNotes: document.getElementById("save-notes"),
      notesStatus: document.getElementById("notes-status")
    };

    this.attach();
    this.setupAuth();
  }

  setupAuth() {
    authService.onAuthStateChanged((user) => {
      this.currentUser = user;
    });
  }

  attach() {
    this.els.file?.addEventListener("change", (e) => this.handleFile(e));
    this.els.loadMock?.addEventListener("click", () => {
      this.loadMatch(this.api.getMockMatch());
    });
    this.els.prev?.addEventListener("click", () => this.goRound(-1));
    this.els.next?.addEventListener("click", () => this.goRound(1));
    this.els.saveNotes?.addEventListener("click", () => this.saveRoundNotes());
  }

  async handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const json = JSON.parse(text);
      this.loadMatch(json);
    } catch (err) {
      alert("Invalid JSON file.");
      console.error(err);
    }
  }

  loadMatch(match) {
    if (!match || !Array.isArray(match.rounds)) {
      alert("Match JSON must include a rounds[] array.");
      return;
    }
    this.match = match;
    this.roundIndex = 0;
    this.enableReviewUI(true);
    this.render();
    this.loadRoundNotes();
  }

  enableReviewUI(enabled) {
    if (this.els.prev) this.els.prev.disabled = !enabled;
    if (this.els.next) this.els.next.disabled = !enabled;
    if (this.els.notes) this.els.notes.disabled = !enabled;
    if (this.els.saveNotes) this.els.saveNotes.disabled = !enabled;
  }

  goRound(delta) {
    if (!this.match) return;
    const next = this.roundIndex + delta;
    if (next < 0 || next >= this.match.rounds.length) return;
    this.roundIndex = next;
    this.render();
    this.loadRoundNotes();
  }

  render() {
    if (!this.match) return;
    const round = this.match.rounds[this.roundIndex];
    const roundNo = round.number ?? (this.roundIndex + 1);

    this.els.indicator.textContent = `Round ${roundNo} / ${this.match.rounds.length}`;

    const meta = this.match.metadata || {};
    this.els.summary.classList.remove("muted");
    this.els.summary.innerHTML = `
      <div><strong>Map:</strong> ${meta.map || "—"}</div>
      <div><strong>Mode:</strong> ${meta.mode || "—"}</div>
      <div style="margin-top: 10px;">
        <strong>Winner:</strong> ${round.winner || "—"}<br>
        <strong>Spike planted:</strong> ${round.spikePlanted ? "Yes" : "No"}
      </div>
    `;

    const kills = Array.isArray(round.kills) ? round.kills : [];
    this.els.kills.classList.remove("muted");
    this.els.kills.innerHTML = kills.length
      ? `<ul style="margin:0; padding-left: 18px;">${kills
          .map(
            (k) =>
              `<li><strong>${k.time || "—"}</strong> ${k.killer} → ${k.victim} (${k.weapon || "?"}${k.hs ? ", HS" : ""})</li>`
          )
          .join("")}</ul>`
      : `<div class="muted">No kill events.</div>`;

    const dmg = Array.isArray(round.damage) ? round.damage : [];
    this.els.damage.classList.remove("muted");
    this.els.damage.innerHTML = dmg.length
      ? `<ul style="margin:0; padding-left: 18px;">${dmg
          .map(
            (d) =>
              `<li><strong>${d.time || "—"}</strong> ${d.from} → ${d.to}: ${d.amount} (${d.body || "—"})</li>`
          )
          .join("")}</ul>`
      : `<div class="muted">No damage events.</div>`;

    // Round navigation
    this.els.prev.disabled = this.roundIndex === 0;
    this.els.next.disabled = this.roundIndex === this.match.rounds.length - 1;
  }

  roundNotesDocId() {
    const matchId = this.match?.metadata?.matchId || this.match?.matchId || "unknown-match";
    const roundNo = this.match?.rounds?.[this.roundIndex]?.number ?? this.roundIndex + 1;
    return { matchId, roundNo };
  }

  async loadRoundNotes() {
    this.els.notesStatus.textContent = "";
    if (!this.currentUser || !firestore || !this.match) {
      this.els.notes.value = "";
      return;
    }

    const { matchId, roundNo } = this.roundNotesDocId();
    try {
      const ref = firestore
        .collection("valorantNotes")
        .doc(this.currentUser.uid)
        .collection("matches")
        .doc(String(matchId))
        .collection("rounds")
        .doc(String(roundNo));
      const snap = await ref.get();
      this.els.notes.value = snap.exists ? (snap.data()?.notes || "") : "";
    } catch (err) {
      console.error(err);
      this.els.notesStatus.textContent = "Could not load notes (offline?).";
    }
  }

  async saveRoundNotes() {
    if (!this.currentUser) {
      alert("Please sign in first.");
      return;
    }
    if (!firestore || !this.match) return;

    const { matchId, roundNo } = this.roundNotesDocId();
    const notes = this.els.notes.value || "";
    this.els.notesStatus.textContent = "Saving...";

    try {
      const ref = firestore
        .collection("valorantNotes")
        .doc(this.currentUser.uid)
        .collection("matches")
        .doc(String(matchId))
        .collection("rounds")
        .doc(String(roundNo));

      await ref.set(
        {
          notes,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        { merge: true }
      );

      this.els.notesStatus.textContent = "Saved.";
    } catch (err) {
      console.error(err);
      this.els.notesStatus.textContent = "Save failed (offline?).";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new ValorantTracker();
});


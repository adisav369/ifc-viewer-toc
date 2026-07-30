import type { Evidence } from "../retrieval/retrievalTypes";

export function renderEvidencePanel(evidence: Evidence[]) {
  const panel = document.getElementById("evidence-panel")!;
  const body = document.getElementById("evidence-body")!;

  if (evidence.length === 0) {
    panel.style.display = "none";
    body.innerHTML = "";
    return;
  }

  panel.style.display = "block";
  body.innerHTML = evidence
    .map(
      (e) => `
      <div class="row">
        <span class="label">${e.documentName}</span><br>
        Page ${e.page} · Confidence: ${e.confidence.toFixed(2)}<br>
        "${e.text}"
      </div>
      <hr style="border-color:#333; margin:8px 0;">
    `
    )
    .join("");
}
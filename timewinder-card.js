/*
 * TimeWinder Operations Hub — Lovelace card
 * Zero-build vanilla custom element (no external dependencies, no compile step).
 * Renders a drift overview from the sensors exposed by the timewinder_ops integration.
 *
 * Minimal config:
 *   type: custom:timewinder-card
 *
 * Full config (defaults shown — only override what differs):
 *   type: custom:timewinder-card
 *   title: TimeWinder Drift
 *   open_entity: sensor.timewinder_operations_hub_open_total
 *   escalations_entity: sensor.timewinder_operations_hub_open_followups
 *   sms_entity: sensor.timewinder_operations_hub_sms_failed
 *   online_entity: sensor.timewinder_operations_hub_users_online
 *   incidents_entity: sensor.timewinder_operations_hub_incidents
 *   app_url: https://drift.timewinder.dk
 *   max_incidents: 10
 */

const VERSION = "0.1.2";

const DEFAULTS = {
  title: "TimeWinder Drift",
  open_entity: "sensor.timewinder_operations_hub_open_total",
  escalations_entity: "sensor.timewinder_operations_hub_open_followups",
  sms_entity: "sensor.timewinder_operations_hub_sms_failed",
  online_entity: "sensor.timewinder_operations_hub_users_online",
  incidents_entity: "sensor.timewinder_operations_hub_incidents",
  app_url: "https://drift.timewinder.dk",
  max_incidents: 10,
};

const escHtml = (s) =>
  String(s == null ? "" : s).replace(
    /[&<>"']/g,
    (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])
  );

const taskUrl = (baseUrl, id) =>
  `${String(baseUrl || "").replace(/\/+$/, "")}/task/${encodeURIComponent(String(id))}`;

class TimeWinderCard extends HTMLElement {
  static getStubConfig() {
    return { type: "custom:timewinder-card" };
  }

  setConfig(config) {
    this._config = { ...DEFAULTS, ...config };
    if (!this._root) this._root = this.attachShadow({ mode: "open" });
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() {
    return 4;
  }

  _state(entity) {
    const s = this._hass && this._hass.states[entity];
    return s ? s.state : null;
  }

  _attr(entity, key, fallback) {
    const s = this._hass && this._hass.states[entity];
    return s && s.attributes[key] !== undefined ? s.attributes[key] : fallback;
  }

  _render() {
    if (!this._hass || !this._config) return;
    const c = this._config;

    const openState = this._state(c.open_entity);
    const open = openState == null ? "—" : openState;
    const crit = Number(this._attr(c.open_entity, "critical", 0)) || 0;
    const unassigned = Number(this._attr(c.open_entity, "unassigned", 0)) || 0;
    const esc = this._state(c.escalations_entity);
    const sms = this._state(c.sms_entity);
    const online = this._state(c.online_entity);

    const items = this._attr(c.incidents_entity, "items", []) || [];
    const rows =
      items
        .slice(0, c.max_incidents)
        .map((i) => {
          const tag = i.id ? "a" : "div";
          const href = i.id
            ? ` href="${escHtml(taskUrl(c.app_url, i.id))}" target="_blank" rel="noreferrer"`
            : "";
          return `
          <${tag} class="row"${href}>
            <span class="prio prio-${escHtml((i.priority || "").toLowerCase())}"></span>
            <div class="rcol">
              <div class="rtitle">${escHtml(i.title || "(uden titel)")}</div>
              <div class="rmeta">${escHtml(i.reportingPointName || "")}${
            i.area ? " · " + escHtml(i.area) : ""
          }${i.assignedToDisplayName ? " → " + escHtml(i.assignedToDisplayName) : ""}</div>
            </div>
            <span class="status">${escHtml(i.status || "")}</span>
          </${tag}>`;
        })
        .join("") || `<div class="empty">Ingen åbne sager 🎉</div>`;

    const kpi = (value, label, cls) =>
      `<div class="kpi ${cls || ""}"><div class="v">${escHtml(value)}</div><div class="l">${escHtml(
        label
      )}</div></div>`;

    this._root.innerHTML = `
      <style>
        ha-card { padding: 12px 16px 16px; }
        .kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px; }
        .kpi { background: var(--secondary-background-color); border-radius: 10px; padding: 10px 8px; text-align: center; }
        .kpi .v { font-size: 1.6rem; font-weight: 700; line-height: 1.1; }
        .kpi .l { font-size: 0.72rem; color: var(--secondary-text-color); margin-top: 2px; }
        .kpi.alert { background: rgba(244, 67, 54, 0.15); }
        .kpi.alert .v { color: var(--error-color, #f44336); }
        .kpi.warn .v { color: var(--warning-color, #ff9800); }
        .list { display: flex; flex-direction: column; }
        .row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-top: 1px solid var(--divider-color); color: inherit; text-decoration: none; }
        a.row:hover .rtitle { text-decoration: underline; }
        .rcol { flex: 1; min-width: 0; }
        .rtitle { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .rmeta { font-size: 0.78rem; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .status { font-size: 0.75rem; color: var(--secondary-text-color); white-space: nowrap; }
        .prio { width: 8px; height: 8px; border-radius: 50%; background: var(--disabled-text-color); flex: 0 0 auto; }
        .prio-critical { background: #f44336; }
        .prio-high { background: #ff9800; }
        .prio-normal { background: #4caf50; }
        .prio-low { background: #9e9e9e; }
        .empty { padding: 16px 0; text-align: center; color: var(--secondary-text-color); }
      </style>
      <ha-card header="${escHtml(c.title)}">
        <div class="kpis">
          ${kpi(open, "Åbne", crit > 0 ? "alert" : "")}
          ${kpi(crit, "Kritiske", crit > 0 ? "alert" : "")}
          ${kpi(unassigned, "Ikke tildelt")}
          ${kpi(esc == null ? "—" : esc, "Eskaleringer", Number(esc) > 0 ? "warn" : "")}
          ${kpi(sms == null ? "—" : sms, "SMS-fejl", Number(sms) > 0 ? "warn" : "")}
          ${kpi(online == null ? "—" : online, "Online")}
        </div>
        <div class="list">${rows}</div>
      </ha-card>`;
  }
}

if (!customElements.get("timewinder-card")) {
  customElements.define("timewinder-card", TimeWinderCard);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "timewinder-card",
  name: "TimeWinder Drift Card",
  description: "Drift-overblik fra TimeWinder Operations Hub (åbne sager, eskaleringer, SMS-fejl, online, sagsliste).",
  preview: false,
});

console.info(
  `%c TIMEWINDER-CARD %c v${VERSION} `,
  "color:white;background:#1565c0;font-weight:700;border-radius:3px 0 0 3px;padding:2px 4px",
  "color:#1565c0;background:white;border-radius:0 3px 3px 0;padding:2px 4px"
);

# TimeWinder Drift Card

A custom [Lovelace](https://www.home-assistant.io/dashboards/) card for Home Assistant that
shows a drift overview from the **TimeWinder Operations Hub** — open incidents (with the
critical / unassigned breakdown), escalations, SMS failures, users online, and the live
incident list.

It reads the sensors created by the
[`timewinder_ops` integration](https://github.com/TimeWinder-dk/timewinder-ha). Install that first.

![type:video](#)

## Install via HACS

1. HACS → ⋮ → **Custom repositories** → `https://github.com/TimeWinder-dk/timewinder-cards`, type **Dashboard**.
2. Install **TimeWinder Drift Card**. HACS adds the JS resource automatically (advanced mode);
   if not, add it under **Settings → Dashboards → ⋮ → Resources**:
   `/hacsfiles/timewinder-cards/timewinder-card.js` (type: JavaScript module).
3. Hard-refresh the browser (Ctrl/Cmd+Shift+R).

## Manual install

Copy `timewinder-card.js` to `config/www/`, then add the resource
`/local/timewinder-card.js` (JavaScript module) under Dashboards → Resources.

## Usage

Minimal — uses the default entity ids from the integration:

```yaml
type: custom:timewinder-card
```

Full configuration (override only what differs):

```yaml
type: custom:timewinder-card
title: TimeWinder Drift
open_entity: sensor.timewinder_operations_hub_abne_sager
escalations_entity: sensor.timewinder_operations_hub_abne_eskaleringer
sms_entity: sensor.timewinder_operations_hub_sms_fejlet
online_entity: sensor.timewinder_operations_hub_brugere_online
incidents_entity: sensor.timewinder_operations_hub_sagsliste
max_incidents: 10
```

> If your entity ids differ (check **Developer Tools → States** for `sensor.timewinder...`),
> set them explicitly in the config above.

## Ready-made dashboard

[`dashboards/timewinder.yaml`](dashboards/timewinder.yaml) is a full YAML-mode dashboard with four
views — **Overblik**, **Teams**, **Analytics**, **Varegård & Bar** — built on the `timewinder_ops`
sensors and this card.

Deploy it:

1. Copy `dashboards/timewinder.yaml` to your HA `config/dashboards/timewinder.yaml`.
2. Register it in `configuration.yaml`:

   ```yaml
   lovelace:
     mode: storage
     dashboards:
       timewinder-drift:
         mode: yaml
         title: TimeWinder
         icon: mdi:clipboard-pulse
         show_in_sidebar: true
         filename: dashboards/timewinder.yaml
   ```
3. Restart Home Assistant — the **TimeWinder** dashboard appears in the sidebar.

> Adjust the entity ids in the file if yours differ (check **Developer Tools → States**).

## License

MIT

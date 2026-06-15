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

## License

MIT

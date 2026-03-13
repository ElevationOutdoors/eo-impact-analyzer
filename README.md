# Elevation Outdoors — Program Impact Analyzer

A self-contained web tool for analyzing pre/post survey data from Elevation Outdoors youth programs. It connects directly to JotForm via API and displays participant outcomes across all program domains.

---

## Live Site

**[https://elevationoutdoors.github.io/eo-impact-analyzer/](https://elevationoutdoors.github.io/eo-impact-analyzer/)**

Password-protected — contact your program manager for access.

---

## What It Does

- Pulls pre and post survey responses directly from JotForm (no file uploads needed)
- Analyzes outcomes across domains: Self-Confidence, Grit, Perseverance, Leadership, and more
- Displays bar charts, trend lines, and year-over-year comparisons
- Generates a printable summary report for each program and year
- Supports manual CSV upload as a fallback if JotForm is unavailable

---

## Programs Supported

| Code | Program |
|------|---------|
| `lts` | Learn to Shred |
| `ltr` | Live to Ride |
| `gag` | Get a Grip |
| `tah` | Take a Hike |
| `rtr` | Ready to Roll |
| `lia` | Leaders in Action |

---

## Files

| File | Purpose |
|------|---------|
| `Index.html` | The entire application — one self-contained file |
| `netlify.toml` | Header config (kept for reference; not used on GitHub Pages) |
| `README.md` | This file |

---

## How to Use the Tool

1. Go to the live site and enter the password
2. Enter your JotForm API key when prompted (found in JotForm → Account → API)
3. Select a program from the dropdown
4. Click **Connect to JotForm** — data loads automatically
5. Use the year selector and domain filters to explore the data
6. Click **Print / Save as PDF** to export a summary report

Your API key is never saved — you'll need to re-enter it each session.

---

## How to Update the Tool

If you need to make changes (e.g., add a new program, update the password, or change survey field mappings):

1. Edit `Index.html` locally
2. Go to [github.com/ElevationOutdoors/eo-impact-analyzer](https://github.com/ElevationOutdoors/eo-impact-analyzer)
3. Click on `Index.html` → click the pencil (Edit) icon → paste updated content → click **Commit changes**
4. GitHub Pages will update the live site within 1–2 minutes

### Changing the Password

Open `Index.html` and find this line near the top:

```javascript
var ACCESS_PASSWORD = "EOimpact2025";
```

Replace `EOimpact2025` with your new password and commit the change.

---

## Embedding in WordPress

Add a **Custom HTML** block to any WordPress page with:

```html
<iframe
  src="https://elevationoutdoors.github.io/eo-impact-analyzer/"
  width="100%"
  height="950px"
  frameborder="0"
  style="border: none; border-radius: 12px;"
  title="Elevation Outdoors Program Impact Analyzer"
></iframe>
```

---

## Technical Notes

- No build tools, no dependencies to install — runs entirely in the browser
- Uses React 18, Chart.js 4, and Babel (all loaded from cdnjs CDN)
- JotForm data is fetched directly from the JotForm REST API with pagination support
- API key is stored in React component state only (never in localStorage or the page source)
- Password check runs client-side — suitable for keeping casual visitors out, not for securing sensitive data

---

## Contact

Elevation Outdoors · [elevationoutdoors.ca](https://elevationoutdoors.ca) · mike@elevationoutdoors.ca

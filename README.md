# Germain’s App (Cursor Learning Game)

Browser-based mini-game (Mario-style platformer) for learning about Cursor’s customers, product value, releases, and the SDLC—built as a **simple, public** project with **no external APIs** (stubbed local content only).

See [`prd.md`](./prd.md) for the full product requirements.

## Play

- **Live (GitHub Pages):** [https://germain-cassis-cursor.github.io/germains-app/](https://germain-cassis-cursor.github.io/germains-app/)  
  *(If you see 404, open **Settings → Pages** in the repo and set **Build and deployment** source to **GitHub Actions**, then re-run the workflow or push again.)*

- **Local:** open `web/index.html` in a browser, or from the repo root run a static server so `fetch()` can load JSON, for example:

  ```bash
  cd web && python3 -m http.server 8080
  ```

  Then visit `http://127.0.0.1:8080/`.

## Repo layout

| Path | Purpose |
| --- | --- |
| `web/` | Static game (HTML/CSS/JS + `content/*.json` stubs) |
| `prd.md` | Product requirements |

## License

To be chosen (see PRD: public OSS-friendly license).

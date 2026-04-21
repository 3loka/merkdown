# Merkdown

A lightweight local Markdown + Mermaid viewer for macOS, built with Electron.

Open any `.md`, `.markdown`, `.mmd`, or `.mermaid` file and see it rendered beautifully — with live auto-reload on save, syntax highlighting, a TOC sidebar, and full Mermaid diagram support.

## Features

- **Markdown rendering** via [marked](https://marked.js.org/)
- **Mermaid diagrams** (flowcharts, sequence, git graph, class, pie, etc.) via [mermaid.js](https://mermaid.js.org/)
- **Syntax highlighting** for code blocks via [highlight.js](https://highlightjs.org/)
- **Auto-reload** on file change via [chokidar](https://github.com/paulmillr/chokidar)
- **TOC sidebar** auto-built from headings
- **File browser** showing sibling Markdown files in the same folder
- **Recent files** history
- **Drag & drop** `.md` onto the window
- **Search** (⌘F) with prev/next navigation
- **Zoom** (⌘+ / ⌘-) to scale rendered text
- **Toggle source** (⌘U) to see raw Markdown
- **Toggle sidebar** (⌘\)
- **Save As** (⌘⇧S)
- **Reveal in Finder** (⌘⇧R)
- **Dark theme** (Catppuccin-inspired palette)

## Getting started

```bash
git clone https://github.com/3loka/merkdown.git
cd merkdown
npm install
npm start
```

To open a file from the command line:

```bash
npm start -- path/to/file.md
```

Or via Electron directly:

```bash
npx electron . path/to/file.md
```

## Keyboard shortcuts

| Shortcut   | Action              |
| ---------- | ------------------- |
| ⌘O         | Open file           |
| ⌘R         | Reload current file |
| ⌘⇧R        | Reveal in Finder    |
| ⌘F         | Find in document    |
| ⌘U         | Toggle source view  |
| ⌘\         | Toggle sidebar      |
| ⌘+ / ⌘-    | Zoom in / out       |

## Sample

Open [sample.md](sample.md) to see everything the viewer can render.

## Requirements

- macOS (primary target; other platforms may work but are untested)
- Node.js 18+
- npm

## Tech stack

- [Electron](https://www.electronjs.org/) — desktop shell
- [marked](https://marked.js.org/) — Markdown parsing
- [mermaid](https://mermaid.js.org/) — diagram rendering
- [highlight.js](https://highlightjs.org/) — code syntax highlighting
- [chokidar](https://github.com/paulmillr/chokidar) — file watching

## License

MIT — see [LICENSE](LICENSE).

# Mermaid Markdown Viewer — Sample

Welcome! This file demonstrates everything the viewer can render.

---

## Flowchart

```mermaid
flowchart TD
    A[Start] --> B{Is it a .md file?}
    B -- Yes --> C[Render with Mermaid Viewer]
    B -- No --> D[Open with another app]
    C --> E[Enjoy 🎉]
```

---

## Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant Viewer
    participant FS as File System

    User->>Viewer: Drop file / ⌘O
    Viewer->>FS: Read file
    FS-->>Viewer: Content
    Viewer->>Viewer: Parse Markdown
    Viewer->>Viewer: Render Mermaid
    Viewer-->>User: Beautiful preview
    FS-->>Viewer: File changed (chokidar)
    Viewer-->>User: Auto-reload ↺
```

---

## Git Graph

```mermaid
gitGraph
   commit id: "initial"
   commit id: "add markdown support"
   branch feature/mermaid
   checkout feature/mermaid
   commit id: "add mermaid"
   commit id: "dark theme"
   checkout main
   merge feature/mermaid id: "merge"
   commit id: "v1.0"
```

---

## Tables

| Feature          | Status  | Notes                        |
|------------------|---------|------------------------------|
| Markdown render  | ✅ Done | via `marked`                 |
| Mermaid diagrams | ✅ Done | via `mermaid.js`             |
| Syntax highlight | ✅ Done | via `highlight.js`           |
| Auto-reload      | ✅ Done | via `chokidar`               |
| TOC sidebar      | ✅ Done | auto-built from headings     |
| Drag & drop      | ✅ Done | drop `.md` onto the window   |
| Search (⌘F)      | ✅ Done | with prev/next navigation    |
| Zoom (⌘+/-)      | ✅ Done | scales rendered text         |

---

## Code Blocks

```typescript
interface DiagramConfig {
  theme: 'dark' | 'light';
  autoReload: boolean;
  watchPath: string;
}

async function renderDiagram(config: DiagramConfig): Promise<SVGElement> {
  const { svg } = await mermaid.render('diagram', config.watchPath);
  return svg;
}
```

---

## Task List

- [x] Flowcharts
- [x] Sequence diagrams  
- [x] Git graphs
- [x] Pie charts
- [x] Class diagrams
- [ ] Export to PDF *(coming soon)*

---

## Pie Chart

```mermaid
pie title File Types Supported
    "Markdown (.md)" : 45
    "Mermaid (.mmd)" : 30
    "Markdown (.markdown)" : 25
```

---

## Blockquote

> **Tip:** Save this file and edit it — the viewer will **auto-reload** instantly whenever you save changes.

---

## Class Diagram

```mermaid
classDiagram
    class MarkdownViewer {
        +String filePath
        +Boolean autoReload
        +render(content) void
        +buildToc() void
        +watchFile() void
    }
    class MermaidRenderer {
        +initialize(config) void
        +render(id, code) SVG
    }
    class FileWatcher {
        +watch(path) void
        +onChange(callback) void
        +close() void
    }
    MarkdownViewer --> MermaidRenderer
    MarkdownViewer --> FileWatcher
```

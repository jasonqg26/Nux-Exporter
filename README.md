# Nux Exporter

Nux Exporter is an open-source Obsidian plugin that consolidates a complete vault or a selected folder into one structured Markdown document optimized for navigation and use with AI tools.

## Features

- Export the complete vault from the command palette.
- Export a folder and all its subfolders from the file explorer context menu.
- Generate a hierarchical table of contents with native Obsidian wikilinks.
- Preserve source paths and add navigation back to the index.
- Remove YAML frontmatter from source notes.
- Convert wikilinks to readable text.
- Convert embeds such as `![[image.png]]` to `[Imagen: image.png]`.
- Extract readable text from Excalidraw notes without including compressed drawing data.
- Calculate document, word, and character totals.
- Exclude generated exports and ignored folders.

## Ignored folders

The following folders are excluded by default:

- `.obsidian`
- `.git`
- `.trash`
- `node_modules`
- `ANEXOS`

## Usage

### Export a folder

1. In Obsidian's file explorer, right-click or long-press a folder.
2. Select **Export folder as consolidated documentation**.
3. Nux Exporter creates `<Folder name>_AI.md` inside the selected folder.

Only Markdown files inside the selected folder and its subfolders are included.

### Export the complete vault

1. Open the command palette.
2. Run **Export consolidated documentation**.
3. Nux Exporter creates `<Vault name>_AI.md` in the vault root.

Running an export again replaces the previously generated file at the same path.

## Generated document

Each export contains:

- Export scope and generation statistics.
- A hierarchical, navigable index.
- Context and interpretation rules for AI tools.
- One section per source document.
- A unique document ID, original path, and source folder.
- Normalized Markdown content.

## Installation

### Community plugins

Nux Exporter is not yet available in the Obsidian community plugin directory.

### Manual installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the latest GitHub release.
2. Create `<Vault>/.obsidian/plugins/nux-exporter/`.
3. Copy the downloaded files into that directory.
4. Reload Obsidian.
5. Enable **Nux Exporter** under **Settings → Community plugins**.

## Privacy

Nux Exporter:

- Does not collect analytics or telemetry.
- Does not make network requests.
- Does not require an account.
- Does not access files outside the active Obsidian vault.
- Processes and writes all content locally.

## Compatibility

- Minimum Obsidian version: 1.5.0.
- Desktop and mobile are declared as supported.

## Development

Requirements:

- Node.js 18 or later.
- npm 9 or later.

Install dependencies:

```bash
npm install
```

Start a development build:

```bash
npm run dev
```

Check TypeScript and create a production build:

```bash
npm run check
npm run build
```

The production bundle is generated as `main.js` in the repository root.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development and contribution guidelines.

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting instructions.

## License

Nux Exporter is distributed under the [MIT License](LICENSE).

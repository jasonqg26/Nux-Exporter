# Contributing to Nux Exporter

Contributions, bug reports, and focused feature proposals are welcome.

## Development setup

1. Fork and clone the repository.
2. Install Node.js 18 or later and npm 9 or later.
3. Install dependencies with `npm install`.
4. Run `npm run dev` while developing.

## Verification

Before submitting a pull request, run:

```bash
npm run check
npm run build
```

## Pull requests

- Keep changes focused on one concern.
- Preserve the existing module boundaries.
- Use Obsidian APIs instead of direct filesystem access.
- Avoid adding dependencies unless they are necessary.
- Update documentation when behavior changes.
- Describe how the change was tested.

## Reporting bugs

Open a GitHub issue with:

- Obsidian version and operating system.
- Nux Exporter version.
- Export scope and relevant folder structure.
- Expected and actual behavior.
- Reproduction steps.

Do not include private vault content in public issues.


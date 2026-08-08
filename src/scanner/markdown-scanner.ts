import type { TFile, Vault } from "obsidian";

export interface MarkdownScanOptions {
	rootPath: string;
	outputPath: string;
}

export const DEFAULT_IGNORED_FOLDER_NAMES: ReadonlySet<string> = new Set([
	".obsidian",
	".git",
	".trash",
	"node_modules",
	"ANEXOS"
]);

/** Discovers exportable Markdown files in deterministic path order. */
export class MarkdownScanner {
	public constructor(
		private readonly ignoredFolderNames: ReadonlySet<string> = DEFAULT_IGNORED_FOLDER_NAMES
	) {}

	public findMarkdownFiles(vault: Vault, options: MarkdownScanOptions): TFile[] {
		return vault
			.getMarkdownFiles()
			.filter(
				(file) =>
					this.isWithinRoot(file, options.rootPath) &&
					!this.isIgnored(file) &&
					file.path !== options.outputPath &&
					!this.isGeneratedExport(file, vault.getName())
			)
			.sort((left, right) => this.comparePaths(left.path, right.path));
	}

	private isWithinRoot(file: TFile, rootPath: string): boolean {
		return rootPath.length === 0 || file.path.startsWith(`${rootPath}/`);
	}

	private isGeneratedExport(file: TFile, vaultName: string): boolean {
		const folders = this.parentFolders(file.path);
		const scopeName = folders.at(-1) ?? vaultName;

		return file.name === `${scopeName}_AI.md`;
	}

	private isIgnored(file: TFile): boolean {
		return this.parentFolders(file.path).some((folder) =>
			this.ignoredFolderNames.has(folder)
		);
	}

	private parentFolders(path: string): string[] {
		return path.split("/").slice(0, -1);
	}

	private comparePaths(left: string, right: string): number {
		const normalizedLeft = left.toLowerCase();
		const normalizedRight = right.toLowerCase();

		if (normalizedLeft < normalizedRight) {
			return -1;
		}

		if (normalizedLeft > normalizedRight) {
			return 1;
		}

		return 0;
	}
}

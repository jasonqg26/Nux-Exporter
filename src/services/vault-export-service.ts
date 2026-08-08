import { normalizePath, type TFolder, type Vault } from "obsidian";

import { MarkdownExportBuilder } from "../builder/markdown-export-builder";
import { VaultFileExporter } from "../exporter/vault-file-exporter";
import { MarkdownLoader } from "../loader/markdown-loader";
import type { VaultExportResult } from "../models/export-document";
import { MarkdownProcessor } from "../processor/markdown-processor";
import { MarkdownScanner } from "../scanner/markdown-scanner";

/** Coordinates the export pipeline without coupling its stages to Obsidian UI. */
export class VaultExportService {
	private readonly scanner = new MarkdownScanner();
	private readonly loader = new MarkdownLoader();
	private readonly processor = new MarkdownProcessor();
	private readonly builder = new MarkdownExportBuilder();
	private readonly exporter = new VaultFileExporter();

	public async exportVault(vault: Vault): Promise<VaultExportResult> {
		return this.exportScope(vault, vault.getName(), "");
	}

	public async exportFolder(vault: Vault, folder: TFolder): Promise<VaultExportResult> {
		return this.exportScope(vault, folder.name, folder.path);
	}

	private async exportScope(
		vault: Vault,
		title: string,
		rootPath: string
	): Promise<VaultExportResult> {
		const outputPath = normalizePath(
			rootPath.length === 0 ? `${title}_AI.md` : `${rootPath}/${title}_AI.md`
		);
		const files = this.scanner.findMarkdownFiles(vault, { rootPath, outputPath });
		const loadedDocuments = await this.loader.load(vault, files);
		const cleanedDocuments = loadedDocuments.map((document) => ({
			...document,
			content: this.processor.clean(document.content)
		}));
		const builtExport = this.builder.build({
			title,
			scopePath: rootPath,
			documents: cleanedDocuments
		});

		await this.exporter.write(vault, outputPath, builtExport.content);

		return {
			outputPath,
			statistics: builtExport.statistics
		};
	}
}

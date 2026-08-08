import { TFile, type Vault } from "obsidian";

/** Creates or replaces the generated Markdown file in the Vault root. */
export class VaultFileExporter {
	public async write(vault: Vault, outputPath: string, content: string): Promise<void> {
		const existingFile = vault.getAbstractFileByPath(outputPath);

		if (existingFile instanceof TFile) {
			await vault.process(existingFile, () => content);
			return;
		}

		if (existingFile) {
			throw new Error(`Cannot write the export to "${outputPath}".`);
		}

		await vault.create(outputPath, content);
	}
}

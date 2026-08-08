import type { TFile, Vault } from "obsidian";

import type { LoadedMarkdownDocument } from "../models/export-document";

/** Loads file content through Obsidian's Vault API. */
export class MarkdownLoader {
	public async load(vault: Vault, files: TFile[]): Promise<LoadedMarkdownDocument[]> {
		return Promise.all(
			files.map(async (file) => ({
				file,
				content: await vault.read(file)
			}))
		);
	}
}


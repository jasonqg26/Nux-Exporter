import { Plugin } from "obsidian";

import { registerExportVaultCommand } from "./commands/export-vault-command";

export default class NuxExporterPlugin extends Plugin {
	onload(): void {
		console.log("Nux Exporter loaded");
		registerExportVaultCommand(this);
	}

	onunload(): void {
		console.log("Nux Exporter unloaded");
	}
}

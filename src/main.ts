import { Plugin } from "obsidian";

import { registerExportVaultCommand } from "./commands/export-vault-command";

export default class NuxExporterPlugin extends Plugin {
	onload(): void {
		registerExportVaultCommand(this);
	}
}

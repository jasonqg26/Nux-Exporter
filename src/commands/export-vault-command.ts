import { Notice, TFolder, type Plugin } from "obsidian";

import type { VaultExportResult } from "../models/export-document";
import { VaultExportService } from "../services/vault-export-service";

export function registerExportVaultCommand(plugin: Plugin): void {
	const exportService = new VaultExportService();
	const runExport = async (
		exportOperation: () => Promise<VaultExportResult>
	): Promise<void> => {
		try {
			const result = await exportOperation();
			new Notice(
				`Export created: ${result.outputPath} (${result.statistics.documents} documents)`
			);
		} catch (error) {
			console.error("Nux Exporter: export failed", error);
			new Notice("Export failed. Check the developer console for details.");
		}
	};

	plugin.addCommand({
		id: "export-vault-documentation",
		name: "Export consolidated documentation",
		callback: () => runExport(() => exportService.exportVault(plugin.app.vault))
	});

	plugin.registerEvent(
		plugin.app.workspace.on("file-menu", (menu, file) => {
			if (!(file instanceof TFolder)) {
				return;
			}

			menu.addItem((item) => {
				item
					.setTitle("Export folder as consolidated documentation")
					.setIcon("file-output")
					.onClick(() =>
						runExport(() => exportService.exportFolder(plugin.app.vault, file))
					);
			});
		})
	);
}

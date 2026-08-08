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
				`Exportación creada: ${result.outputPath} (${result.statistics.documents} documentos)`
			);
		} catch (error) {
			console.error("Nux Exporter: export failed", error);
			new Notice("No se pudo crear la exportación. Revisa la consola para más detalles.");
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
					.setTitle("Exportar carpeta con Nux Exporter")
					.setIcon("file-output")
					.onClick(() =>
						runExport(() => exportService.exportFolder(plugin.app.vault, file))
					);
			});
		})
	);
}

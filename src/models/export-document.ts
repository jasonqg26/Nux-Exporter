import type { TFile } from "obsidian";

export interface LoadedMarkdownDocument {
	file: TFile;
	content: string;
}

export interface ExportDocument {
	id: number;
	folder: string;
	path: string;
	name: string;
	content: string;
}

export interface ExportStatistics {
	documents: number;
	words: number;
	characters: number;
}

export interface VaultExportResult {
	outputPath: string;
	statistics: ExportStatistics;
}


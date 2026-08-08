import type {
	ExportDocument,
	ExportStatistics,
	LoadedMarkdownDocument
} from "../models/export-document";

export interface BuildExportInput {
	title: string;
	scopePath: string;
	documents: LoadedMarkdownDocument[];
}

export interface BuiltExport {
	content: string;
	statistics: ExportStatistics;
}

interface TableOfContentsNode {
	name: string;
	documents: ExportDocument[];
	children: Map<string, TableOfContentsNode>;
}

/** Builds the consolidated Markdown document in the prototype's format. */
export class MarkdownExportBuilder {
	public build(input: BuildExportInput): BuiltExport {
		const documents = input.documents.map((document, index) =>
			this.toExportDocument(document, index + 1)
		);
		const statistics = this.calculateStatistics(documents);

		return {
			content: this.composeDocument(
				input.title,
				input.scopePath,
				documents,
				statistics
			),
			statistics
		};
	}

	private toExportDocument(document: LoadedMarkdownDocument, id: number): ExportDocument {
		const path = document.file.path;
		const separatorIndex = path.lastIndexOf("/");

		return {
			id,
			folder: separatorIndex === -1 ? "Raíz" : path.slice(0, separatorIndex),
			path,
			name: document.file.basename,
			content: document.content
		};
	}

	private calculateStatistics(documents: ExportDocument[]): ExportStatistics {
		return documents.reduce<ExportStatistics>(
			(statistics, document) => ({
				documents: statistics.documents + 1,
				words: statistics.words + this.countWords(document.content),
				characters: statistics.characters + Array.from(document.content).length
			}),
			{ documents: 0, words: 0, characters: 0 }
		);
	}

	private countWords(content: string): number {
		return content.match(/\S+/gu)?.length ?? 0;
	}

	private composeDocument(
		title: string,
		scopePath: string,
		documents: ExportDocument[],
		statistics: ExportStatistics
	): string {
		const lines = [
			`# Exportación: ${title}`,
			"",
			"> Documentación consolidada optimizada para IA.",
			"",
			"## Resumen de exportación",
			"",
			`- Generado: ${this.formatDate(new Date())}`,
			`- Alcance: ${scopePath.length === 0 ? "Vault completo" : scopePath}`,
			`- Documentos: ${statistics.documents}`,
			`- Palabras: ${statistics.words}`,
			`- Caracteres: ${statistics.characters}`,
			"",
			"## Índice",
			"",
			...this.buildTableOfContents(title, scopePath, documents),
			"---",
			"",
			"## Contexto para IA",
			"",
			"Este documento consolida archivos Markdown independientes dentro del alcance indicado.",
			"",
			"Reglas de interpretación:",
			"",
			"- Cada sección `DOC-XXXX` corresponde a un archivo de origen.",
			"- `Ruta original` identifica la ubicación del archivo dentro del Vault.",
			"- Los wikilinks fueron convertidos a texto plano.",
			"- Los embeds se representan como `[Imagen: nombre]`.",
			"- De los archivos Excalidraw se conserva únicamente el texto legible.",
			"",
			"---",
			"",
			...this.buildDocumentSections(documents)
		];

		return `${lines.join("\n")}\n`;
	}

	private buildTableOfContents(
		title: string,
		scopePath: string,
		documents: ExportDocument[]
	): string[] {
		const root: TableOfContentsNode = {
			name: title,
			documents: [],
			children: new Map()
		};

		for (const document of documents) {
			const folderSegments = this.relativeFolderSegments(document.folder, scopePath);
			let currentNode = root;

			for (const folderName of folderSegments) {
				let childNode = currentNode.children.get(folderName);

				if (!childNode) {
					childNode = {
						name: folderName,
						documents: [],
						children: new Map()
					};
					currentNode.children.set(folderName, childNode);
				}

				currentNode = childNode;
			}

			currentNode.documents.push(document);
		}

		return [...this.renderTableOfContentsNode(root, 0), ""];
	}

	private relativeFolderSegments(folder: string, scopePath: string): string[] {
		if (folder === "Raíz" || folder === scopePath) {
			return [];
		}

		const scopePrefix = scopePath.length === 0 ? "" : `${scopePath}/`;
		const relativeFolder = folder.startsWith(scopePrefix)
			? folder.slice(scopePrefix.length)
			: folder;

		return relativeFolder.split("/").filter((segment) => segment.length > 0);
	}

	private renderTableOfContentsNode(
		node: TableOfContentsNode,
		depth: number
	): string[] {
		const indentation = "  ".repeat(depth);
		const documentCount = this.countNodeDocuments(node);
		const countLabel = documentCount === 1 ? "1 documento" : `${documentCount} documentos`;
		const lines = [
			`${indentation}- **${this.escapeMarkdownText(node.name)}** — ${countLabel}`
		];
		const itemIndentation = "  ".repeat(depth + 1);

		for (const document of node.documents) {
			lines.push(`${itemIndentation}- ${this.buildDocumentWikiLink(document)}`);
		}

		for (const childNode of [...node.children.values()].sort((left, right) =>
			this.compareText(left.name, right.name)
		)) {
			lines.push(...this.renderTableOfContentsNode(childNode, depth + 1));
		}

		return lines;
	}

	private countNodeDocuments(node: TableOfContentsNode): number {
		return (
			node.documents.length +
			[...node.children.values()].reduce(
				(total, childNode) => total + this.countNodeDocuments(childNode),
				0
			)
		);
	}

	private buildDocumentWikiLink(document: ExportDocument): string {
		const id = `DOC-${this.formatId(document.id)}`;
		const heading = `${id} — ${document.name}`;
		const label = `${id} · ${document.name}`;

		return `[[#${this.escapeWikiLinkPart(heading)}|${this.escapeWikiLinkPart(label)}]]`;
	}

	private buildDocumentSections(documents: ExportDocument[]): string[] {
		return documents.flatMap((document) => [
			`## DOC-${this.formatId(document.id)} — ${document.name}`,
			"",
			`> **Ruta original:** ${document.path}`,
			">",
			`> **Carpeta:** ${document.folder}`,
			"",
			"---",
			"",
			document.content.trim(),
			"",
			"[[#Índice|Volver al índice]]",
			"",
			"---",
			""
		]);
	}

	private escapeMarkdownText(text: string): string {
		return text.replace(/\\/g, "\\\\").replace(/([*_])/g, "\\$1");
	}

	private escapeWikiLinkPart(text: string): string {
		return text
			.replace(/\\/g, "\\\\")
			.replace(/\|/g, "\\|")
			.replace(/\]/g, "\\]");
	}

	private compareText(left: string, right: string): number {
		if (left < right) {
			return -1;
		}

		if (left > right) {
			return 1;
		}

		return 0;
	}

	private formatId(id: number): string {
		return id.toString().padStart(4, "0");
	}

	private formatDate(date: Date): string {
		const pad = (value: number): string => value.toString().padStart(2, "0");

		return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
	}
}

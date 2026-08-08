/** Applies the same Markdown normalization rules as the Python prototype. */
export class MarkdownProcessor {
	public clean(content: string): string {
		const normalizedContent = this.normalizeLineEndings(content);
		const isExcalidraw = this.isExcalidrawDocument(normalizedContent);
		const contentWithoutFrontmatter = this.removeFrontmatter(normalizedContent);
		const relevantContent = isExcalidraw
			? this.extractExcalidrawText(contentWithoutFrontmatter)
			: contentWithoutFrontmatter;
		const convertedContent = this.convertWikiLinks(
			this.convertEmbeds(relevantContent)
		);

		return this.demoteHeadings(convertedContent);
	}

	private normalizeLineEndings(content: string): string {
		return content.replace(/\r\n?/g, "\n");
	}

	private removeFrontmatter(content: string): string {
		return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
	}

	private isExcalidrawDocument(content: string): boolean {
		return (
			/^---\n[\s\S]*?^excalidraw-plugin:\s*parsed\s*$[\s\S]*?^---\s*$/m.test(content) ||
			/^# Excalidraw Data\s*$/m.test(content)
		);
	}

	private extractExcalidrawText(content: string): string {
		const textHeading = /^## Text Elements\s*$/m.exec(content);

		if (!textHeading) {
			return "> El archivo Excalidraw no contiene elementos de texto.";
		}

		const textStart = textHeading.index + textHeading[0].length;
		const contentAfterHeading = content.slice(textStart);
		const drawingDataStart = /^\s*%%\s*$/m.exec(contentAfterHeading)?.index;
		const textElements = contentAfterHeading
			.slice(0, drawingDataStart ?? contentAfterHeading.length)
			.replace(/[ \t]+\^[A-Za-z0-9-]+(?=\s*$)/gm, "")
			.trim();

		if (textElements.length === 0) {
			return "> El archivo Excalidraw no contiene elementos de texto.";
		}

		return `**Texto extraído del diagrama Excalidraw:**\n\n${textElements}`;
	}

	private convertEmbeds(content: string): string {
		return content.replace(/!\[\[(.*?)\]\]/g, (_match, target: string) => {
			return `[Imagen: ${target}]`;
		});
	}

	private convertWikiLinks(content: string): string {
		return content.replace(/\[\[(.*?)(\|(.*?))?\]\]/g, (_match, target: string, _separator: string, alias: string) => {
			return alias || target;
		});
	}

	private demoteHeadings(content: string): string {
		const lines = content.split("\n");
		let fenceCharacter: "`" | "~" | null = null;
		let fenceLength = 0;

		return lines
			.map((line) => {
				const fence = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];

				if (fence) {
					const currentCharacter = fence[0] as "`" | "~";

					if (fenceCharacter === null) {
						fenceCharacter = currentCharacter;
						fenceLength = fence.length;
					} else if (
						currentCharacter === fenceCharacter &&
						fence.length >= fenceLength
					) {
						fenceCharacter = null;
						fenceLength = 0;
					}

					return line;
				}

				if (fenceCharacter !== null) {
					return line;
				}

				return line.replace(/^(#{1,6})([ \t]+)(.*)$/, (_match, hashes: string, spacing: string, title: string) => {
					const level = Math.min(hashes.length + 2, 6);
					return `${"#".repeat(level)}${spacing}${title}`;
				});
			})
			.join("\n");
	}
}

import {
	Plugin,
	MarkdownRenderer,
	PluginSettingTab,
	App,
	Setting,
} from "obsidian";

interface SimpleFlashcardsPluginSettings {
	toggleRevealMethod: "surface-click" | "button-click" | "hover";
}

const DEFAULT_SETTINGS: SimpleFlashcardsPluginSettings = {
	toggleRevealMethod: "surface-click",
};

export default class SimpleFlashcardsPlugin extends Plugin {
	settings: SimpleFlashcardsPluginSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new RevealMethodSettingsTab(this.app, this));

		this.registerMarkdownCodeBlockProcessor(
			"flashcard",
			(source, el, ctx) => {
				this.renderFlashcard(source, el, ctx);
			}
		);

		this.registerDomEvent(document, "DOMContentLoaded", () => {
			this.adjustFlashcardHeight();
		});

		this.registerEvent(
			this.app.workspace.on("resize", () => {
				this.adjustFlashcardHeight();
			})
		);
	}

	async renderFlashcard(source: string, el: HTMLElement, ctx: any) {
		const lines = source.split("\n").filter((line) => line.length > 0);
		const flashcardContainer = el.createDiv({ cls: "flashcard-container" });
		const flashcardEl = flashcardContainer.createDiv({ cls: "flashcard" });
		const frontFace = flashcardEl.createDiv({
			cls: "flashcard-face flashcard-face--front",
		});
		const backFace = flashcardEl.createDiv({
			cls: "flashcard-face flashcard-face--back",
		});

		if (this.isClozeFlashcard(lines)) {
			await this.renderClozeContent(
				lines.join("\n"),
				frontFace,
				backFace,
				ctx
			);
		} else {
			const { question, answer } = this.parseQAFormat(lines);
			await MarkdownRenderer.render(
				this.app,
				question,
				frontFace,
				ctx.sourcePath,
				this
			);
			await MarkdownRenderer.render(
				this.app,
				answer,
				backFace,
				ctx.sourcePath,
				this
			);
		}

		this.setupRevealMethod(
			flashcardContainer,
			flashcardEl,
			frontFace,
			backFace
		);
	}

	isClozeFlashcard(lines: string[]): boolean {
		return lines.some((line) => line.includes("{{") && line.includes("}}"));
	}

	parseQAFormat(lines: string[]): { question: string; answer: string } {
		let question = "";
		let answer = "";
		let isAnswer = false;

		lines.forEach((line) => {
			if (line.startsWith("Q:")) {
				question += line.substring(2).trim() + "\n\n";
			} else if (line.startsWith("A:")) {
				answer += line.substring(2).trim() + "\n\n";
				isAnswer = true;
			} else if (isAnswer) {
				answer += line + "\n";
			} else {
				question += line + "\n";
			}
		});

		return {
			question: question.trim(),
			answer: answer.trim(),
		};
	}

	setupRevealMethod(
		flashcardContainer: HTMLElement,
		flashcardEl: HTMLElement,
		frontFace: HTMLElement,
		backFace: HTMLElement
	) {
		switch (this.settings.toggleRevealMethod) {
			case "hover":
				flashcardContainer.addEventListener("mouseenter", () => {
					flashcardEl.addClass("is-flipped");
				});
				flashcardContainer.addEventListener("mouseleave", () => {
					flashcardEl.removeClass("is-flipped");
				});
				break;

			case "surface-click":
				flashcardEl.addClass("clickable");
				flashcardContainer.addEventListener("click", (event) => {
					if ((event.target as HTMLElement).closest("img")) {
						event.stopPropagation();
					} else {
						flashcardEl.toggleClass(
							"is-flipped",
							!flashcardEl.hasClass("is-flipped")
						);
					}
				});
				break;

			case "button-click":
			default: {
				const revealButton = frontFace.createEl("button", {
					cls: "flashcard-button",
					text: "Reveal answer",
				});
				revealButton.addEventListener("click", () => {
					flashcardEl.addClass("is-flipped");
				});

				const hideButton = backFace.createEl("button", {
					cls: "flashcard-button",
					text: "Hide answer",
				});
				hideButton.addEventListener("click", () => {
					flashcardEl.removeClass("is-flipped");
				});
				break;
			}
		}
	}

	onunload() {
		console.log("Unloading Simple Flashcards plugin");
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	getClozeFront(content: string): string {
		const clozeRegex = /{{(.*?)}}/g;
		return content.replace(clozeRegex, (_, word) => {
			return "&#95;".repeat(word.length);
		});
	}

	getClozeBack(content: string): string {
		const clozeRegex = /{{(.*?)}}/g;
		return content.replace(clozeRegex, (_, hiddenText) => {
			return `<span class='cloze-reveal'>${hiddenText}</span>`;
		});
	}

	async renderClozeContent(
		content: string,
		frontFace: HTMLElement,
		backFace: HTMLElement,
		ctx: any
	) {
		const frontContent = this.getClozeFront(content);
		const backContent = this.getClozeBack(content);

		await MarkdownRenderer.render(
			this.app,
			frontContent,
			frontFace,
			ctx.sourcePath,
			this
		);
		await MarkdownRenderer.render(
			this.app,
			backContent,
			backFace,
			ctx.sourcePath,
			this
		);
	}

	adjustFlashcardHeight() {
		document.querySelectorAll(".flashcard").forEach((flashcard) => {
			const frontFace = flashcard.querySelector(".flashcard-face--front");
			const backFace = flashcard.querySelector(".flashcard-face--back");

			if (
				frontFace instanceof HTMLElement &&
				backFace instanceof HTMLElement
			) {
				const frontHeight = frontFace.scrollHeight;
				const backHeight = backFace.scrollHeight;

				const maxHeight = Math.max(frontHeight, backHeight);
				(flashcard as HTMLElement).style.height = `${maxHeight}px`;
			}
		});
	}
}

class RevealMethodSettingsTab extends PluginSettingTab {
	plugin: SimpleFlashcardsPlugin;

	constructor(app: App, plugin: SimpleFlashcardsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Simple flashcards settings" });

		new Setting(containerEl)
			.setName("Reveal method")
			.setDesc("Choose how to reveal the answer on flashcards")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("surface-click", "Click on flashcard")
					.addOption("button-click", "Click on button")
					.addOption("hover", "Hover over flashcard")
					.setValue(this.plugin.settings.toggleRevealMethod)
					.onChange(
						async (
							value: SimpleFlashcardsPluginSettings["toggleRevealMethod"]
						) => {
							this.plugin.settings.toggleRevealMethod = value;
							await this.plugin.saveSettings();
						}
					)
			);
	}
}

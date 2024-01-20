import { Plugin } from "obsidian";
import { RevealMethodSettingsTab } from "settings/reveal-method";
import { marked } from "marked";

interface SimpleFlashcardsPluginSettings {
	toggleRevealMethod: "hover" | "button-click" | "surface-click";
}

const DEFAULT_SETTINGS: SimpleFlashcardsPluginSettings = {
	toggleRevealMethod: "hover",
};

export default class SimpleFlashcardsPlugin extends Plugin {
	settings: SimpleFlashcardsPluginSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new RevealMethodSettingsTab(this.app, this));

		this.registerMarkdownCodeBlockProcessor(
			"flashcard",
			async (source, el, ctx) => {
				const lines = source
					.split("\n")
					.filter((line) => line.length > 0);

				const flashcardContainer = el.createEl("div", {
					cls: "flashcard-container",
				});

				const flashcardEl = flashcardContainer.createEl("div", {
					cls: "flashcard",
				});
				const frontFace = flashcardEl.createEl("div", {
					cls: "flashcard-face flashcard-face--front",
				});
				const backFace = flashcardEl.createEl("div", {
					cls: "flashcard-face flashcard-face--back",
				});

				if (lines[0].startsWith("Q:")) {
					const questionParts = [] as string[];
					const answerParts = [] as string[];
					let isAnswer = false;

					lines.forEach((line) => {
						if (line.startsWith("Q:")) {
							questionParts.push(line.substring(2).trim());
							isAnswer = false;
						} else if (line.startsWith("A:")) {
							if (answerParts.length > 0) {
								answerParts[answerParts.length - 1] += "  ";
							}
							answerParts.push(line.substring(2).trim());
							isAnswer = true;
						} else if (isAnswer) {
							answerParts.push(line.trim());
						}
					});

					const question = questionParts.join(" ");
					const answer = answerParts.join("  \n");

					frontFace.innerHTML = await marked(question, {
						async: true,
					});
					backFace.innerHTML = await marked(answer, { async: true });
				} else {
					let frontContent = lines.join(" ");
					let backContent = lines.join(" ");

					frontContent = this.getClozeFront(frontContent);
					backContent = this.getClozeBack(backContent);

					frontFace.innerHTML = await marked(frontContent, {
						async: true,
					});
					const answerContainer = backFace.createEl("div", {
						cls: "answer-container",
					});
					answerContainer.innerHTML = await marked(backContent, {
						async: true,
						gfm: true,
						breaks: true,
					});
				}

				switch (this.settings.toggleRevealMethod) {
					case "hover":
						flashcardContainer.addEventListener(
							"mouseenter",
							() => {
								flashcardEl.classList.add("is-flipped");
							}
						);
						flashcardContainer.addEventListener(
							"mouseleave",
							() => {
								flashcardEl.classList.remove("is-flipped");
							}
						);
						break;

					case "surface-click":
						flashcardEl.classList.add("clickable");
						flashcardContainer.addEventListener(
							"click",
							(event) => {
								//@ts-ignore
								if (event.target.closest("img")) {
									event.stopPropagation();
								} else {
									flashcardEl.classList.toggle("is-flipped");
								}
							}
						);
						break;

					case "button-click":
					default: {
						const revealButton = frontFace.createEl("button", {
							cls: "flashcard-button",
							text: "Reveal",
						});
						revealButton.addEventListener("click", () => {
							flashcardEl.classList.add("is-flipped");
						});

						const hideButton = backFace.createEl("button", {
							cls: "flashcard-button",
							text: "Hide",
						});
						hideButton.addEventListener("click", () => {
							flashcardEl.classList.remove("is-flipped");
						});
						break;
					}
				}
			}
		);

		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (
					mutation.type === "childList" &&
					mutation.addedNodes.length > 0
				) {
					this.adjustFlashcardHeight();
				}
			});
		});

		const config = { childList: true, subtree: true };

		const targetNode = this.app.workspace.containerEl;
		observer.observe(targetNode, config);
	}

	onunload() {
		console.log("unloading plugin");
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
			const underscoreText = "_".repeat(word.length);
			return underscoreText;
		});
	}

	getClozeBack(content: string): string {
		const clozeRegex = /{{(.*?)}}/g;
		return content.replace(clozeRegex, (_, hiddenText, __) => {
			return `<span class='cloze-reveal'>${hiddenText}</span>`;
		});
	}

	adjustFlashcardHeight() {
		document.querySelectorAll(".flashcard").forEach((flashcard) => {
			const frontFace = flashcard.querySelector(".flashcard-face--front");
			const backFace = flashcard.querySelector(".flashcard-face--back");

			const frontHeight = frontFace ? frontFace.scrollHeight : 0;
			const backHeight = backFace ? backFace.scrollHeight : 0;

			const maxHeight = Math.max(frontHeight, backHeight);
			//@ts-ignore
			flashcard.style.height = maxHeight + "px";
		});
	}
}

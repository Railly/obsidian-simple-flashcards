import SimpleFlashcardsPlugin from "../main";
import { App, PluginSettingTab, Setting } from "obsidian";

export class RevealMethodSettingsTab extends PluginSettingTab {
	plugin: SimpleFlashcardsPlugin;

	constructor(app: App, plugin: SimpleFlashcardsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Reveal Method")
			.setDesc("Choose how the flashcard reveals the answer.")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("button-click", "Button Click")
					.addOption("surface-click", "Surface Click")
					.addOption("hover", "On Hover")
					.setValue(this.plugin.settings.toggleRevealMethod)
					.onChange(
						async (
							value: "hover" | "button-click" | "surface-click"
						) => {
							this.plugin.settings.toggleRevealMethod = value;
							await this.plugin.saveSettings();
						}
					)
			);
	}
}

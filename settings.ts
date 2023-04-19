import { App, Notice, PluginSettingTab, Setting } from 'obsidian';
import { BMOSettings, DEFAULT_SETTINGS } from './main';
import BMOGPT from './main';

export class BMOSettingTab extends PluginSettingTab {
	plugin: BMOGPT;

	constructor(app: App, plugin: BMOGPT) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for BMO-Obsdian-GPT'});

		const usageText = containerEl.createEl("p", {
		    text: "Check usage: ",
		});

		const statusText = containerEl.createEl("p", {
		    text: "Check status: ",
		});
		

		const usageLink = containerEl.createEl("a", {
				text: "https://platform.openai.com/account/usage",
				href: "https://platform.openai.com/account/usage",
		});

		const statusLink = containerEl.createEl("a", {
			text: "https://status.openai.com/",
			href: "https://status.openai.com/",
	});


	usageText.appendChild(usageLink);
	statusText.appendChild(statusLink);

		new Setting(containerEl)
			.setName('OpenAI API Key')
			.setDesc('Insert API Key from OpenAI')
			.addText(text => text
				.setPlaceholder('OpenAI-api-key')
				.setValue(this.plugin.settings.apiKey)
				.onChange(async (value) => {
					this.plugin.settings.apiKey = value;
					await this.plugin.saveSettings();
				}));

        new Setting(containerEl)
        .setName('Chatbot Name')
        .setDesc('Name your chatbot')
        .addText(text => text
            .setPlaceholder('Enter chatbot name')
            .setValue(this.plugin.settings.chatbotName || DEFAULT_SETTINGS.chatbotName)
            .onChange(async (value) => {
            this.plugin.settings.chatbotName = value || DEFAULT_SETTINGS.chatbotName;
            await this.plugin.saveSettings();
            const chatbotNameHeading = document.querySelector('#chatbotNameHeading') as HTMLHeadingElement;
            const chatbotNames = document.querySelectorAll('#chatbotName') as NodeListOf<HTMLHeadingElement>;
            if (chatbotNameHeading) {
                chatbotNameHeading.textContent = this.plugin.settings.chatbotName;
            }
            chatbotNames.forEach(chatbotName => {
                chatbotName.textContent = this.plugin.settings.chatbotName;
            });
            })
        );

		new Setting(containerEl)
			.setName('Model')
			.setDesc('Snapshot of gpt-3.5-turbo from March 1st 2023. Unlike gpt-3.5-turbo, this model will not receive updates, and will only be supported for a three month period ending on June 1st 2023. (Training Data: Up to Sep 2021)')
			.addText(text => text
				.setValue('gpt-3.5-turbo-0301')
				.setDisabled(true)
		);

		new Setting(containerEl)
			.setName('System')
			.setDesc('System role prompt')
			.addTextArea(text => text
				.setPlaceholder('You are a helpful assistant.')
				.setValue(this.plugin.settings.system_role || DEFAULT_SETTINGS.system_role)
				.onChange(async (value) => {
					this.plugin.settings.system_role = value || DEFAULT_SETTINGS.system_role;
					await this.plugin.saveSettings();
				})
		);

		new Setting(containerEl)
			.setName('Max Tokens')
			.setDesc(descLink('The maximum number of tokens, or words, that the model is allowed to generate in its output (Max Token: 4096).', 'https://platform.openai.com/tokenizer'))
			.addText(text => text
				.setPlaceholder('4096')
				.setValue(this.plugin.settings.max_tokens)
				.onChange(async (value) => {
					this.plugin.settings.max_tokens = value;
					await this.plugin.saveSettings();
				})
		);

		new Setting(containerEl)
			.setName('Temperature')
			.setDesc('Temperature controls how random the generated output is. Lower values (closer to 0) make the text more predictable, while higher values (closer to 1) make it more creative and unpredictable.')
			.addText(text => text
				.setPlaceholder('1')
				.setValue(this.plugin.settings.temperature || DEFAULT_SETTINGS.temperature)
				.onChange(async (value) => {
					this.plugin.settings.temperature = value;
					await this.plugin.saveSettings();
				})
		);

		function descLink(text: string, link: string): DocumentFragment {
				const frag = new DocumentFragment();
				const desc = document.createElement('span');
				desc.innerText = text + ' ';
				frag.appendChild(desc);

				const anchor = document.createElement('a');
				anchor.href = link;
				anchor.target = '_blank';
				anchor.rel = 'noopener noreferrer';
				anchor.innerText = 'https://platform.openai.com/tokenizer';
				frag.appendChild(anchor);

				return frag;
		};
	}
}

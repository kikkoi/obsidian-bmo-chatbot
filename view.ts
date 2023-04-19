import { ItemView, WorkspaceLeaf, Notice, View } from "obsidian";
import { marked } from "marked";
import {DEFAULT_SETTINGS, BMOSettings} from './main';

export const VIEW_TYPE_EXAMPLE = "example-view";

let messageHistory = "";

export function setMessageHistory(newMessageHistory: string) {
    messageHistory = newMessageHistory;
}

export class BMOView extends ItemView {
    private messageEl: HTMLElement;
    private settings: BMOSettings;

    constructor(leaf: WorkspaceLeaf, settings: BMOSettings) {
        super(leaf);
        this.settings = settings;
        this.icon = 'bot';
    }

    getViewType() {
        return VIEW_TYPE_EXAMPLE;
    }

    getDisplayText() {
        return "Chatbot";
    }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        const chatbotContainer = container.createEl("div", {
            attr: {
                class: "chatbotContainer",
            }
        });

    chatbotContainer.createEl("h1", { 
        text: this.settings.botName || DEFAULT_SETTINGS.botName,
        attr: {
          id: "chatbotName"
        }
    });

    chatbotContainer.createEl("p", {
        text: "Model: GPT-3.5-Turbo",
        attr: {
            id: "modelName"
          }
    });

    chatbotContainer.createEl("div", {
        attr: {
            id: "messageContainer",
        }
    });
    
    const chatbox = chatbotContainer.createEl("div", {
        attr: {
            id: "chatbox",
        }
    });
    const textarea = document.createElement("textarea");
    textarea.setAttribute("contenteditable", true.toString());
    textarea.setAttribute("placeholder", "Start typing...");
    chatbox.appendChild(textarea);


    const loadingEl = chatbotContainer.createEl("div", {
        attr: {
            id: "loading",
        },
        text: "..."
    });
    
    const textareaElement = textarea as HTMLTextAreaElement;
      
    
    textareaElement.addEventListener("keyup", (event) => {
        if (!event.shiftKey && event.key === "Enter") {
            event.preventDefault(); // prevent submission
            const input = textareaElement.value.trim();
            if (input.length === 0) { // check if input is empty or just whitespace
                return;
            }

            messageHistory += input + "\n";
            // this.BMOchatbot(input);
            console.log(messageHistory);

            // Create a new paragraph element for each message
            const userMessage = document.createElement("div");
            userMessage.classList.add("userMessage");
            userMessage.style.display = "inline-block";
            
            const userNameSpan = document.createElement("span"); 
            userNameSpan.innerText = "USER"; 
            userNameSpan.setAttribute("id", "userName"); 
            userMessage.appendChild(userNameSpan);
            
            const userParagraph = document.createElement("p");
            userParagraph.innerHTML = marked(input);
            userParagraph.innerHTML = input.replace(/\n/g, "<br>"); //save the newlines

            userMessage.appendChild(userParagraph);

            // Append the new message to the message container
            const messageContainer = document.querySelector("#messageContainer");
            if (messageContainer) {
                messageContainer.appendChild(userMessage);
            
                const botMessage = document.createElement("div");
                botMessage.classList.add("botMessage"); 
                botMessage.style.display = "inline-block"; 
                messageContainer.appendChild(botMessage);
            
                const botNameSpan = document.createElement("span"); 
                botNameSpan.innerText = this.settings.botName || DEFAULT_SETTINGS.botName;
                botNameSpan.setAttribute("id", "botName")
                // botNameSpan.style.display = "block"; 
                botMessage.appendChild(botNameSpan); 
            
                const loadingEl = document.createElement("span");
                loadingEl.setAttribute("id", "loading"); 
                loadingEl.style.display = "inline-block"; 
                loadingEl.textContent = "..."; 
                botMessage.appendChild(loadingEl);
                loadingEl.scrollIntoView({ behavior: 'smooth', block: 'end' });

                // Define a function to update the loading animation
                const updateLoadingAnimation = () => {
                    // Access the loadingEl element with optional chaining
                    const loadingEl = document.querySelector('#loading');
                    // If loadingEl is null or undefined, return early
                    if (!loadingEl) {
                        return;
                    }
                    // Add a dot to the loading animation
                    loadingEl.textContent += ".";
                    // If the loading animation has reached three dots, reset it to one dot
                    if (loadingEl.textContent?.length && loadingEl.textContent.length > 3) {
                        loadingEl.textContent = ".";
                }
            };                

            // Call the updateLoadingAnimation function every 500 milliseconds
            const loadingAnimationIntervalId = setInterval(updateLoadingAnimation, 500);

            // Call the chatbot function with the user's input
            this.BMOchatbot(input)
                .then(response => {
                    // Stop the loading animation and update the bot message with the response
                    clearInterval(loadingAnimationIntervalId);
                })
                .catch(error => {
                    // Stop the loading animation and update the bot message with an error message
                    clearInterval(loadingAnimationIntervalId);
                    loadingEl.textContent = "";
                    const botParagraph = document.createElement("p");
                    botParagraph.innerText = "Oops, something went wrong. Please try again.";
                    botMessage.appendChild(botParagraph);
                });
            }

            setTimeout(() => {
                textareaElement.value = "";
                textareaElement.style.height = "25px";
                textareaElement.value = textareaElement.value.replace(/^[\r\n]+|[\r\n]+$/gm,""); // remove newlines only at beginning or end of input
                textareaElement.setSelectionRange(0, 0);
            }, 0);
        }
    });

    textareaElement.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) { // check if enter key was pressed
          event.preventDefault(); // prevent default behavior
        }
      });
      
      textareaElement.addEventListener("input", (event) => {
        if (textareaElement.value.indexOf('\n') === -1) {
            textareaElement.style.height = "25px";
        }
        textareaElement.style.height = `${textareaElement.scrollHeight}px`;
    });

    textareaElement.addEventListener("blur", (event) => {
    if (!textareaElement.value) {
        textareaElement.style.height = "25px";
    }});
  }

  async BMOchatbot(input: string) {
    if (!this.settings.apiKey) {
        const botName = document.querySelector('.botName');
        const botMessage = document.querySelector('.botMessage');
        const removeLoading = document.querySelector('#loading') as HTMLDivElement;
        const disableChatbox = document.getElementById('chatbox');
        (disableChatbox as HTMLTextAreaElement).disabled = true;
        new Notice("API key not found. Please add your OpenAI API key in the plugin settings.");
        if (botName){
            botName.innerHTML = "ERROR";
        }
        if (removeLoading) {
            removeLoading.innerHTML = '';
            removeLoading.style.cssText = '';
          }
        if (botMessage){
            const newMessage = document.createElement('p');
            newMessage.textContent = "API key not found. Please add your OpenAI API key in the plugin settings.";
            newMessage.classList.add('errorMessage');
            botMessage.appendChild(newMessage);
        }
        return;
      }
    
    try {
    	const maxTokens = this.settings.max_tokens;
    	const temperature = this.settings.temperature;

    	const response = await fetch('https://api.openai.com/v1/chat/completions', {
    		method: 'POST',
    		headers: {
    			'Content-Type': 'application/json',
    			'Authorization': `Bearer ${this.settings.apiKey}`
    		},
    		body: JSON.stringify({
    			model: 'gpt-3.5-turbo',
    			messages: [
    				{ role: 'system', content: this.settings.system_role},
    				{ role: 'user', content: messageHistory }
    			],
    			max_tokens: parseInt(maxTokens),
    			temperature: parseFloat(temperature),
    		}),
    	});

        const data = await response.json();
        console.log(data);

        const message = data.choices[0].message.content;
        messageHistory += message + "\n";


        // Append the bmoMessage element to the messageContainer div
        const messageContainerEl = document.getElementById("messageContainer");

        if (messageContainerEl) {
            const botMessages = messageContainerEl.querySelectorAll(".botMessage");
            const lastBotMessage = botMessages[botMessages.length - 1];
            const loadingEl = lastBotMessage.querySelector("#loading");
            
            if (loadingEl) {
                loadingEl.scrollIntoView({ behavior: 'smooth', block: 'end' });
                lastBotMessage.removeChild(loadingEl); // Remove loading message
            }
          
            const messageBlock = document.createElement("p");
            messageBlock.textContent = message;
            messageBlock.innerHTML = marked(message);
            messageBlock.classList.add("messageBlock");
            
            lastBotMessage.appendChild(messageBlock);
            lastBotMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } catch (error) {
        new Notice('Error occurred while fetching completion: ' + error.message);
        console.log(error.message);
        console.log("messageHistory: " + messageHistory);
    }
    console.log("BMO settings:", this.settings);
}

  async onClose() {
    // Nothing to clean up.
  }

}

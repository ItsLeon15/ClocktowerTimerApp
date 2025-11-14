'use strict';

let discordWebhookURL = "";
let roleToMention = "";

let beginningMessage = "Nominations beginning";
let callbackMessage = "Nominations are now open! Head back to Town Center";

const element = selector => {
	return document.getElementById(selector);
};

const getAllSelectors = selector => {
	return Array.from(document.querySelectorAll(selector));
};

const saveMessage = type => {
	switch (type) {
		case "beginningMessage":
			if (element("beginningMessage")) {
				beginningMessage = element("beginningMessage").value.trim();
			}
			break;
		case "callbackMessage":
			if (element("callbackMessage")) {
				callbackMessage = element("callbackMessage").value.trim();
			}
			break;
		case "discordWebhookURL":
			if (element("discordWebhookURL")) {
				discordWebhookURL = element("discordWebhookURL").value.trim();
			}
			break;
		case "roleToMention":
			if (element("roleToMention")) {
				roleToMention = element("roleToMention").value.trim();
			}
			break;
	}
};

const sendWebhook = async content => {
	if (!discordWebhookURL) {
		throw new Error('Missing webhook URL');
	}

	const response = await fetch(discordWebhookURL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			content
		})
	});

	if (!response.ok) {
		throw new Error(`Network response was not ok: ${response.status}`);
	}

	return response;
};

const triggerWebhook = async delayInSeconds => {
	if (!discordWebhookURL) {
		alert("Please set the Discord Webhook URL in the Settings dropdown.");
		return;
	}

	if (!beginningMessage) {
		alert("Please set the beginning message in the Settings dropdown.");
		return;
	}

	if (!callbackMessage) {
		alert("Please set the callback message in the Settings dropdown.");
		return;
	}

	if (!roleToMention) {
		alert("Please set the role to mention.");
		return;
	}

	const adjustedTimestamp = Math.floor(Date.now() / 1000) + delayInSeconds;
	const newBeginningMessage = `${beginningMessage} <t:${adjustedTimestamp}:R>`;
	const newCallbackMessage = `<@&${roleToMention}> ${callbackMessage}`;

	try {
		await sendWebhook(newBeginningMessage);

		setTimeout(async () => {
			try {
				await sendWebhook(newCallbackMessage);
				console.log('Callback message sent successfully');
			} catch (error) {
				console.error('Error sending callback message:', error);
			}
		}, delayInSeconds * 1000);
	} catch (error) {
		console.error('Error sending beginning message:', error);
	}
};

const triggerButtonClick = (delay) => {
	let triggerButton = document.getElementById("trigger-" + delay);
	let originalTextContent = triggerButton.textContent;

	triggerButton.textContent = "Triggered!";
	setTimeout(() => triggerButton.textContent = originalTextContent, 2000);

	triggerWebhook(delay).then(r => r);
};

const setup = () => {
	const saveBeginningMessage = element("saveBeginningMessage");
	const saveCallbackMessage = element("saveCallbackMessage");
	const saveDiscordWebhookURL = element("saveDiscordWebhookURL");
	const saveRoleToMention = element("saveRoleToMention");

	const bindSave = (button, type, showSaved) => {
		if (!button) {
			return;
		}

		button.addEventListener("click", () => {
			saveMessage(type);

			if (showSaved) {
				button.textContent = "Saved!";
				setTimeout(() => button.textContent = "Save", 2000);
			}
		});
	};

	bindSave(saveBeginningMessage, "beginningMessage", true);
	bindSave(saveCallbackMessage, "callbackMessage", true);
	bindSave(saveDiscordWebhookURL, "discordWebhookURL", true);
	bindSave(saveRoleToMention, "roleToMention", true);

	const settingsButtonToggle = element("settings-button");
	if (settingsButtonToggle) {
		settingsButtonToggle.addEventListener("click", () => {
			settingsButtonToggle.classList.toggle('open');

			const settingsElement = element('settings');
			if (settingsElement) {
				settingsElement.classList.toggle('active');
			}
		});
	}

	getAllSelectors('[data-delay]').forEach(button => {
		const delay = Number(button.dataset.delay);

		if (!Number.isNaN(delay)) {
			button.addEventListener('click', () => {
				triggerWebhook(delay).then(r => r)
			});
		}
	});

	if (element("beginningMessage")) {
		element("beginningMessage").value = beginningMessage;
	}

	if (element("callbackMessage")) {
		element("callbackMessage").value = callbackMessage;
	}

	if (element("discordWebhookURL")) {
		element("discordWebhookURL").value = discordWebhookURL;
	}

	if (element("roleToMention")) {
		element("roleToMention").value = roleToMention;
	}

	const keyMap = {
		'1': 30,
		'2': 60,
		'3': 120,
		'4': 180,
		'5': 240,
		'6': 300,
		'7': 600
	};

	document.addEventListener('keydown', event => {
		const delay = keyMap[event.key];

		if (delay) {
			triggerWebhook(delay).then(r => r);
		}
	});
};

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', setup);
} else {
	setup();
}

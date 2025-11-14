'use strict';

const discordWebhookURL = "https://discord.com/api/webhooks/1438874570886221915/foowaJD7ZbyYcTCVYbMrfpUn5ywAnGXqjb3Kv7qDa_TPiMK0hoOjT-Tjt96QIRLvFhmQ";
const roleToMention = "1438875926632075406";

let beginningMessage = "Nominations beginning";
let callbackMessage = "Nominations are now open! Head back to Town Center";

const element = selector => {
	return document.getElementById(selector);
};

const getAllSelectors = selector => {
	return Array.from(document.querySelectorAll(selector));
};

const saveMessage = type => {
	if (type === "beginningMessage" && element("beginningMessage")) {
		beginningMessage = element("beginningMessage").value.trim();
	} else if (type === "callbackMessage" && element("callbackMessage")) {
		callbackMessage = element("callbackMessage").value.trim();
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
		alert("Please set the Discord Webhook URL in the code.");
		return;
	}

	if (!beginningMessage || !callbackMessage) {
		alert("Please set both the beginning and callback messages.");
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

	if (saveBeginningMessage) {
		saveBeginningMessage.addEventListener("click", () => {
			saveMessage("beginningMessage")

			saveBeginningMessage.textContent = "Saved!";
			setTimeout(() => saveBeginningMessage.textContent = "Save", 2000);
		});
	}

	if (saveCallbackMessage) {
		saveCallbackMessage.addEventListener("click", () => {
			saveMessage("callbackMessage")

			saveCallbackMessage.textContent = "Saved!";
			setTimeout(() => saveCallbackMessage.textContent = "Save", 2000);
		});
	}

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

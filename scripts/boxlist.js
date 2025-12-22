const axios = require("axios");

module.exports = {
	config: {
		name: "boxlist",
		version: "2.0",
		author: "AkHi",
		countDown: 5,
		role: 2, // শুধুমাত্র অ্যাডমিনদের জন্য
		description: "Group list and management",
		category: "admin",
		guide: "{pn} work with reply"
	},

	onStart: async function ({ api, event, threadsData }) {
		const allThreads = await threadsData.getAll();
		let msg = "👑 𝐆𝐑𝐎𝐔𝐏 𝐋𝐈𝐒𝐓 👑\n━━━━━━━━━━━━━━━━━━\n";
		let list = [];
		let num = 1;

		for (const thread of allThreads) {
			if (thread.isGroup) {
				list.push({
					threadID: thread.threadID,
					threadName: thread.threadName
				});
				msg += `|${num++}| 📂 ${thread.threadName}\n🆔 ${thread.threadID}\n━━━━━━━━━━━━━━━━━━\n`;
			}
		}

		msg += "💡 reply with [number + text] for notify group\n💡 reply with [all + text] for notify\n💡 reply with [number + L] for left\n💡 reply with [all L] for left";

		return api.sendMessage(msg, event.threadID, (err, info) => {
			global.GoatBot.onReply.set(info.messageID, {
				commandName: this.config.name,
				messageID: info.messageID,
				author: event.senderID,
				list
			});
		}, event.messageID);
	},

	onReply: async function ({ api, event, Reply, args, threadsData }) {
		const { author, list } = Reply;
		if (event.senderID != author) return;

		const input = event.body.trim();
		const splitInput = input.split(" ");
		const action = splitInput[0].toLowerCase();
		const messageContent = input.slice(action.length).trim();

		const premiumStyle = (text) => `✨ 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 ✨\n━━━━━━━━━━━━━━━━━━\n\n${text}\n\n━━━━━━━━━━━━━━━━━━\n👤 𝐀𝐝𝐦𝐢𝐧: AkHi`;
		const leaveMsg = "I am leaving this group because AkHi Ma'am (my admin) doesn't want me to be in this group.";

		// ১. সব গ্রুপ থেকে লিভ নেওয়া (all L)
		if (action === "all" && splitInput[1]?.toLowerCase() === "l") {
			api.sendMessage("⏳ left from all box are loading Ma'am", event.threadID);
			for (const group of list) {
				await api.sendMessage(leaveMsg, group.threadID);
				await api.removeUserFromGroup(api.getCurrentUserID(), group.threadID);
			}
			return api.sendMessage("✅ Ma'am, Left successfully from all box", event.threadID);
		}

		// ২. সব গ্রুপে মেসেজ পাঠানো (all [message])
		if (action === "all") {
			api.sendMessage("⏳ Ma'am Your Notification is processing", event.threadID);
			for (const group of list) {
				await api.sendMessage(premiumStyle(messageContent), group.threadID);
			}
			return api.sendMessage("✅ Ma'am your notification send successfuly", event.threadID);
		}

		// ৩. নির্দিষ্ট গ্রুপ থেকে লিভ নেওয়া (number + L)
		if (!isNaN(action) && splitInput[1]?.toLowerCase() === "l") {
			const index = parseInt(action) - 1;
			if (list[index]) {
				const group = list[index];
				await api.sendMessage(leaveMsg, group.threadID);
				await api.removeUserFromGroup(api.getCurrentUserID(), group.threadID);
				return api.sendMessage(`✅ Ma'am left successfully from ${group.threadName}`, event.threadID);
			}
		}

		// ৪. নির্দিষ্ট গ্রুপে মেসেজ পাঠানো (number + message)
		if (!isNaN(action)) {
			const index = parseInt(action) - 1;
			if (list[index]) {
				const group = list[index];
				await api.sendMessage(premiumStyle(messageContent), group.threadID);
				return api.sendMessage(`✅${group.threadName}- notification sent successfully, Ma'am.`, event.threadID);
			}
		}

		return api.sendMessage("⚠️ Wrong format! please Ma'am use the correct number or all.", event.threadID);
	}
};
        

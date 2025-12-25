module.exports = {
	config: {
		name: "refresh",
		version: "1.3",
		author: "AkHi",
		countDown: 60,
		role: 2,
		description: "refresh information of group chat, user or commands",
		category: "box chat",
		guide: "{pn} [thread | group]: refresh information of your group chat"
				+ "\n   {pn} group <threadID>: refresh information of group chat by ID"
				+ "\n   {pn} user: refresh information of your user"
				+ "\n   {pn} user [<userID> | @tag]: refresh information of user by ID"
				+ "\n   {pn} cmd <command name>: refresh a specific command"
				+ "\n   {pn} cmd all: refresh all commands"
	},

	onStart: async function ({ args, threadsData, message, event, usersData, client }) {
		const { threadID, senderID, mentions } = event;

		// Refresh Group/Thread Info
		if (args[0] == "group" || args[0] == "thread") {
			const targetID = args[1] || threadID;
			try {
				await threadsData.refreshInfo(targetID);
				return message.reply(targetID == threadID ? "✓ | Refresh information of your group chat successfully!" : `✓ | Refresh information of group chat ${targetID} successfully!`);
			}
			catch (error) {
				return message.reply(targetID == threadID ? "✗ | Error when refresh information of your group chat" : `✗ | Error when refresh information of group chat ${targetID}`);
			}
		}

		// Refresh User Info
		else if (args[0] == "user") {
			let targetID = senderID;
			if (args[1]) {
				if (Object.keys(mentions).length)
					targetID = Object.keys(mentions)[0];
				else
					targetID = args[1];
			}
			try {
				await usersData.refreshInfo(targetID);
				return message.reply(targetID == senderID ? "✓ | Refresh information of your user successfully!" : `✓ | Refresh information of user ${targetID} successfully!`);
			}
			catch (error) {
				return message.reply(targetID == senderID ? "✗ | Error when refresh information of your user" : `✗ | Error when refresh information of user ${targetID}`);
			}
		}

		// Refresh Commands
		else if (args[0] == "cmd") {
			const cmdName = args[1];
			if (!cmdName) return message.reply("⚠️ Please provide a command name to refresh (Example: !refresh cmd help)");

			if (cmdName.toLowerCase() == "all") {
				try {
					await client.loadAllCommand();
					return message.reply("✓ | Refresh all commands successfully!");
				} catch (e) {
					return message.reply("✗ | Failed to refresh all commands.");
				}
			} else {
				try {
					const command = client.commands.get(cmdName) || client.commands.get(client.aliases.get(cmdName));
					if (!command) return message.reply(`✗ | Command '${cmdName}' not found.`);
					
					await client.loadCommand(command.config.name);
					return message.reply(`✓ | Refresh command '${cmdName}' successfully!`);
				} catch (e) {
					return message.reply(`✗ | Error when refresh command '${cmdName}'`);
				}
			}
		}
		
		else {
			return message.reply("⚠️ Invalid format! Use: !refresh group, !refresh user, or !refresh cmd all");
		}
	}
};

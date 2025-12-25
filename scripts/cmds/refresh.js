module.exports = {
	config: {
		name: "refresh",
		version: "1.3",
		author: "AkHi",
		countDown: 60,
		role: 2,
		description: {
			"refresh information of group chat, user or commands"
		},
		category: "box chat",
		guide: {
			      "{pn} [thread | group]: refresh information of your group chat"
				+ "\n   {pn} group <threadID>: refresh information of group chat by ID"
				+ "\n   {pn} user: refresh information of your user"
				+ "\n   {pn} user [<userID> | @tag]: refresh information of user by ID"
				+ "\n   {pn} cmd <command name>: refresh a specific command"
				+ "\n   {pn} cmd all: refresh all commands"
		}
	},

	    {
			refreshMyThreadSuccess: "✓ | Refresh information of your group chat successfully!",
			refreshThreadTargetSuccess: "✓ | Refresh information of group chat %1 successfully!",
			errorRefreshMyThread: "✗ | Error when refresh information of your group chat",
			errorRefreshThreadTarget: "✗ | Error when refresh information of group chat %1",
			refreshMyUserSuccess: "✓ | Refresh information of your user successfully!",
			refreshUserTargetSuccess: "✓ | Refresh information of user %1 successfully!",
			errorRefreshMyUser: "✗ | Error when refresh information of your user",
			errorRefreshUserTarget: "✗ | Error when refresh information of user %1",
			refreshCmdSuccess: "✓ | Refresh command '%1' successfully!",
			refreshAllCmdSuccess: "✓ | Refresh all commands successfully!",
			errorRefreshCmd: "✗ | Command '%1' not found or error when refresh"
		}
	},

	onStart: async function ({ args, threadsData, message, event, usersData, getLang, client }) {
		const { threadID, senderID, mentions } = event;

		// Refresh Group/Thread Info
		if (args[0] == "group" || args[0] == "thread") {
			const targetID = args[1] || threadID;
			try {
				await threadsData.refreshInfo(targetID);
				return message.reply(targetID == threadID ? getLang("refreshMyThreadSuccess") : getLang("refreshThreadTargetSuccess", targetID));
			}
			catch (error) {
				return message.reply(targetID == threadID ? getLang("errorRefreshMyThread") : getLang("errorRefreshThreadTarget", targetID));
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
				return message.reply(targetID == senderID ? getLang("refreshMyUserSuccess") : getLang("refreshUserTargetSuccess", targetID));
			}
			catch (error) {
				return message.reply(targetID == senderID ? getLang("errorRefreshMyUser") : getLang("errorRefreshUserTarget", targetID));
			}
		}

		// Refresh Commands (Added Part)
		else if (args[0] == "cmd") {
			const cmdName = args[1];
			if (!cmdName) return message.SyntaxError();

			if (cmdName.toLowerCase() == "all") {
				try {
					await client.loadAllCommand();
					return message.reply(getLang("refreshAllCmdSuccess"));
				} catch (e) {
					return message.reply("✗ | Failed to refresh all commands.");
				}
			} else {
				try {
					const command = client.commands.get(cmdName) || client.commands.get(client.aliases.get(cmdName));
					if (!command) return message.reply(getLang("errorRefreshCmd", cmdName));
					
					await client.loadCommand(command.config.name);
					return message.reply(getLang("refreshCmdSuccess", cmdName));
				} catch (e) {
					return message.reply(getLang("errorRefreshCmd", cmdName));
				}
			}
		}
		
		else message.SyntaxError();
	}
};

const fs = require("fs-extra");
const path = require("path");

module.exports = {
	config: {
		name: "help",
		aliases: ["menu", "commands"],
		version: "4.8",
		author: "AkHi",
		shortDescription: "Show all available commands",
		longDescription: "Displays a clean and premium-styled categorized list of commands.",
		category: "system",
		guide: "{pn}help [command name]"
	},

			 "{pn} [empty | <page number> | <command name>]"
				+ "\n   {pn} <command name> [-u | usage | -g | guide]: only show command usage"
				+ "\n   {pn} <command name> [-i | info]: only show command info"
				+ "\n   {pn} <command name> [-r | role]: only show command role"
				+ "\n   {pn} <command name> [-a | alias]: only show command alias"
	
	},

	langs: {
			help: "╭─────────────⭓"
				+ "\n%1"
				+ "\n├─────⭔"
				+ "\n│ Page [ %2/%3 ]"
				+ "\n│ Currently, the bot has %4 commands that can be used"
				+ "\n│ » Type %5help <page> to view the command list"
				+ "\n│ » Type %5help to view the details of how to use that command"
				+ "\n├────────⭔"
				+ "\n│ %6"
				+ "\n╰─────────────⭓",
			help2: "%1├───────⭔"
				+ "\n│ » Currently, the bot has %2 commands that can be used"
				+ "\n│ » Type %3help <command name> to view the details of how to use that command"
				+ "\n│ %4"
				+ "\n╰─────────────⭓",
			commandNotFound: "Command \"%1\" does not exist",
			getInfoCommand: "╭── NAME ────⭓"
				+ "\n│ %1"
				+ "\n├── INFO"
				+ "\n│ Description: %2"
				+ "\n│ Other names: %3"
				+ "\n│ Other names in your group: %4"
				+ "\n│ Version: %5"
				+ "\n│ Role: %6"
				+ "\n│ Time per command: %7s"
				+ "\n│ Author: %8"
				+ "\n├── USAGE"
				+ "\n│%9"
				+ "\n├── NOTES"
				+ "\n│ The content inside <XXXXX> can be changed"
				+ "\n│ The content inside [a|b|c] is a or b or c"
				+ "\n╰──────⭔",
			onlyInfo: "╭── INFO ────⭓"
				+ "\n│ Command name: %1"
				+ "\n│ Description: %2"
				+ "\n│ Other names: %3"
				+ "\n│ Other names in your group: %4"
				+ "\n│ Version: %5"
				+ "\n│ Role: %6"
				+ "\n│ Time per command: %7s"
				+ "\n│ Author: %8"
				+ "\n╰─────────────⭓",
			onlyUsage: "╭── USAGE ────⭓"
				+ "\n│%1"
				+ "\n╰─────────────⭓",
			onlyAlias: "╭── ALIAS ────⭓"
				+ "\n│ Other names: %1"
				+ "\n│ Other names in your group: %2"
				+ "\n╰─────────────⭓",
			onlyRole: "╭── ROLE ────⭓"
				+ "\n│%1"
				+ "\n╰─────────────⭓",
			doNotHave: "Do not have",
			roleText0: "0 (All users)",
			roleText1: "1 (Group administrators)",
			roleText2: "2 (Admin bot)",
			roleText0setRole: "0 (set role, all users)",
			roleText1setRole: "1 (set role, group administrators)",
			pageNotFound: "Page %1 does not exist"
	onStart: async function ({ message, args, prefix }) {
		const allCommands = global.GoatBot.commands;
		const categories = {};

		const emojiMap = {
			ai: "➥", "ai-image": "➥", group: "➥", system: "➥",
			fun: "➥", owner: "➥", config: "➥", economy: "➥",
			media: "➥", "18+": "➥", tools: "➥", utility: "➥",
			info: "➥", image: "➥", game: "➥", admin: "➥",
			rank: "➥", boxchat: "➥", others: "➥"
		};

		const cleanCategoryName = (text) => {
			if (!text) return "others";
			return text
				.normalize("NFKD")
				.replace(/[^\w\s-]/g, "")
				.replace(/\s+/g, " ")
				.trim()
				.toLowerCase();
		};

		for (const [name, cmd] of allCommands) {
			const cat = cleanCategoryName(cmd.config.category);
			if (!categories[cat]) categories[cat] = [];
			categories[cat].push(cmd.config.name);
		}


		if (args[0]) {
			const query = args[0].toLowerCase();
			const cmd =
				allCommands.get(query) ||
				[...allCommands.values()].find((c) => (c.config.aliases || []).includes(query));
			if (!cmd) return message.reply(`❌ Command "${query}" not found.`);

			const {
				name,
				version,
				author,
				guide,
				category,
				shortDescription,
				longDescription,
				aliases,
				role 
			} = cmd.config;

			const desc =
				typeof longDescription === "string"
					? longDescription
					: longDescription?.en || shortDescription?.en || shortDescription || "No description";

			const usage =
				typeof guide === "string"
					? guide.replace(/{pn}/g, prefix)
					: guide?.en?.replace(/{pn}/g, prefix) || `${prefix}${name}`;

						const requiredRole = cmd.config.role !== undefined ? cmd.config.role : 0; 

			return message.reply(
				`☠️ 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗜𝗡𝗙𝗢 ☠️\n\n` +
				`➥ Name: ${name}\n` +
				`➥ Category: ${category || "Uncategorized"}\n` +
				`➥ Description: ${desc}\n` +
				`➥ Aliases: ${aliases?.length ? aliases.join(", ") : "None"}\n` +
				`➥ Usage: ${usage}\n` +
				`➥ Permission: ${requiredRole}\n` + 
				`➥ Author: ${author}\n` +
				`➥ Version: ${version}`
			);
		}

		const formatCommands = (cmds) =>
			cmds.sort().map((cmd) => `× ${cmd}`);

		let msg = `━━━🌸 Lubna Jannat AkHi 🌸━━━\n`;
		const sortedCategories = Object.keys(categories).sort();
		for (const cat of sortedCategories) {
			const emoji = emojiMap[cat] || "➥";
			msg += `\n╭──『 ${cat.toUpperCase()} 』\n`; 
			msg += `${formatCommands(categories[cat]).join(' ')}\n`; 
			msg += `╰────────────◊\n`;
		}
		msg += `\n➥ Use: ${prefix}help [command name] for details\n➥Use: ${prefix}callad to talk with bot admins '_'`;

		return message.reply(msg);
	}
};

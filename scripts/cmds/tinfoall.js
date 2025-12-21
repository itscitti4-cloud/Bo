const fs = require('fs-extra');
const path = require('path');

const filePath = path.join(__dirname, "cache", "babyData.json");

module.exports.config = {
    name: "tinfoall",
    version: "1.0.0",
    author: "AkHi",
    role: 2,
    description: "See the list of top teachers.",
    category: "chat",
    guide: { en: "{pn}" },
    countDown: 5
};

module.exports.onStart = async ({ api, event, usersData }) => {
    const { threadID, messageID } = event;
    let data = fs.readJsonSync(filePath);

    if (!data.teachers || Object.keys(data.teachers).length === 0) {
        return api.sendMessage("None teach🙂😿", threadID, messageID);
    }

    try {
        const sortedTeachers = Object.entries(data.teachers)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15); // টপ ১৫ জন

        let msg = "🏆 𝗧𝗢𝗣 𝗧𝗘𝗔𝗖𝗛𝗘𝗥𝗦 𝗟𝗜𝗦𝗧 🏆\n━━━━━━━━━━━━━━\n";

        for (let i = 0; i < sortedTeachers.length; i++) {
            const [id, count] = sortedTeachers[i];
            const name = (await usersData.get(id)).name || "Unknown";
            msg += `${i + 1}. ${name} — (${count} টি)\n`;
        }

        msg += "\n━━━━━━━━━━━━━━\nThanks to all teacher! ❤️";
        return api.sendMessage(msg, threadID, messageID);
    } catch (e) {
        return api.sendMessage("Error: " + e.message, threadID, messageID);
    }
};

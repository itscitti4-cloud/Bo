const fs = require('fs-extra');
const path = require('path');

// সঠিক পাথ নিশ্চিত করা
const filePath = path.join(process.cwd(), "scripts/cmds/cache/babyData.json");

module.exports = {
  config: {
    name: "tinfo",
    version: "1.0.2",
    author: "AkHi",
    role: 0,
    description: "Check teacher info and ranking.",
    category: "chat",
    guide: { en: "{pn} (reply to a user)" },
    countDown: 5
  },

  onStart: async function ({ api, event, usersData, currenciesData, users, currencies }) {
    const { threadID, messageID, senderID, type, messageReply } = event;
    
    // রিপ্লাই দিলে তার আইডি, না দিলে নিজের আইডি
    let targetID = type === "message_reply" ? messageReply.senderID : senderID;
    
    // ডাটা ফাইল চেক করা
    if (!fs.existsSync(filePath)) {
        return api.sendMessage("❌ Data file not found! Please teach the bot first.", threadID, messageID);
    }

    try {
        let data = fs.readJsonSync(filePath);

        // ১. নাম পাওয়ার জন্য বিভিন্ন পদ্ধতি ট্রাই করা (Compatibility Fix)
        let name = "Facebook User";
        if (usersData && typeof usersData.getName === 'function') {
            name = await usersData.getName(targetID);
        } else if (users && typeof users.getName === 'function') {
            name = await users.getName(targetID);
        }

        // ২. ব্যালেন্স পাওয়ার জন্য বিভিন্ন পদ্ধতি ট্রাই করা (Reading 'get' Fix)
        let money = 0;
        const curData = currenciesData || currencies; // দুটোর যেকোনো একটা কাজ করবে
        if (curData && typeof curData.get === 'function') {
            const userMoney = await curData.get(targetID);
            money = userMoney ? (userMoney.money || 0) : 0;
        }

        // ৩. টিচ সংখ্যা বের করা
        const teachCount = (data.teachers && data.teachers[targetID]) ? data.teachers[targetID] : 0;

        // ৪. র‍্যাঙ্কিং বের করা
        let rank = "N/A";
        if (data.teachers) {
            const sortedTeachers = Object.entries(data.teachers)
                .sort((a, b) => b[1] - a[1]);
            const findRank = sortedTeachers.findIndex(item => item[0] === targetID);
            if (findRank !== -1) rank = findRank + 1;
        }

        // ৫. ইউজার টাইপ নির্ধারণ
        let userType = "Regular User";
        if (teachCount > 100) userType = "Master Teacher 🏆";
        else if (teachCount > 50) userType = "Pro Teacher 🎖️";
        else if (teachCount > 10) userType = "Active Learner 📖";

        const msg = `👤 𝗨𝗦𝗘𝗥 𝗜𝗡𝗙𝗢 👤\n` +
            `━━━━━━━━━━━━━━\n` +
            `📝 Name: ${name}\n` +
            `🎓 Teach: ${teachCount} টি\n` +
            `🏆 Ranking: ${rank}\n` +
            `💎 Balance: ${money} 💸\n` +
            `🎭 Usertype: ${userType}\n` +
            `━━━━━━━━━━━━━━\n` +
            `👑 Admin: Lubna Jannat`;

        return api.sendMessage(msg, threadID, messageID);
    } catch (e) {
        console.error(e);
        return api.sendMessage(`Error: ${e.message}`, threadID, messageID);
    }
  }
};

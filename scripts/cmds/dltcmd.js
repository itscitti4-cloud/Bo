const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "dltcmd",
    version: "1.0.0",
    author: "AkHi",
    countDown: 5,
    role: 2, // শুধুমাত্র বটের প্রধান এডমিন ব্যবহার করতে পারবে
    category: "system",
    shortDescription: {
      en: "Deletes a command file from the bot's directory."
    },
    guide: {
      en: "{p}deletecmd [commandName]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;

    // ১. ফাইল নাম চেক করা
    if (!args[0]) {
      return api.sendMessage("❌ please Ma'am enter the command name ।", threadID, messageID);
    }

    const fileName = args[0].toLowerCase();
    const filePath = path.join(__dirname, `${fileName}.js`);

    try {
      // ২. ফাইলটি আসলেই আছে কি না চেক করা
      if (!fs.existsSync(filePath)) {
        return api.sendMessage(`❓ AkHi Ma'am, '${fileName}' not found!`, threadID, messageID);
      }

      // ৩. ফাইল ডিলিট করা
      fs.unlinkSync(filePath);

      // ৪. সাকসেস মেসেজ
      return api.sendMessage(`🗑️ AkHi Ma'am, '${fileName}' file delete successfully । please restart me।`, threadID, messageID);

    } catch (error) {
      console.error(error);
      return api.sendMessage(`⚠️ AkHi Ma'am file delete failed: ${error.message}`, threadID, messageID);
    }
  }
};

const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "lock",
    version: "1.5.0",
    role: 1,
    author: "AkHi",
    description: "group name, theme, Emoji And cover lock/antichange",
    category: "admin",
    guide: "{pn} on/off",
    countDown: 5
  },

  onStart: async function ({ api, event, args, message }) {
    const { threadID } = event;
    const cacheDir = path.join(__dirname, "cache");
    const lockFile = path.join(cacheDir, "lockData.json");

    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
    if (!fs.existsSync(lockFile)) fs.writeJsonSync(lockFile, {});
    
    let lockData = fs.readJsonSync(lockFile);

    if (args[0] === "on") {
      const threadInfo = await api.getThreadInfo(threadID);
      lockData[threadID] = {
        name: threadInfo.threadName,
        emoji: threadInfo.emoji,
        color: threadInfo.color,
        status: true
      };
      fs.writeJsonSync(lockFile, lockData);
      return message.reply("🔒 | Group info lock ON successfully ✅");
    } 
    
    if (args[0] === "off") {
      if (lockData[threadID]) {
        lockData[threadID].status = false;
        fs.writeJsonSync(lockFile, lockData);
        return message.reply("🔓 | Group info lock OFF successfully ✅");
      }
      return message.reply("⚠️ | Lock is already off.");
    }

    return message.reply("Use: lock on/off");
  },

  onEvent: async function ({ api, event }) {
    const { threadID, logMessageType, logMessageData, author } = event;
    const lockFile = path.join(__dirname, "cache", "lockData.json");

    if (!fs.existsSync(lockFile)) return;
    let lockData = fs.readJsonSync(lockFile);

    // যদি লক অন না থাকে বা পরিবর্তনকারী ব্যক্তি খোদ বট নিজে হয়, তবে কাজ করবে না
    if (!lockData[threadID] || !lockData[threadID].status || author === api.getCurrentUserID()) return;

    const data = lockData[threadID];

    switch (logMessageType) {
      case "log:thread-name":
        if (logMessageData.name !== data.name) {
          api.setTitle(data.name, threadID);
        }
        break;
      case "log:thread-icon":
        if (logMessageData.thread_icon !== data.emoji) {
          api.setEmoji(data.emoji, threadID);
        }
        break;
      case "log:thread-color":
      case "log:thread-style":
        if (logMessageData.thread_color !== data.color) {
          api.changeThreadColor(data.color, threadID);
        }
        break;
    }
  }
};

const axios = require("axios");

module.exports = {
  config: {
    name: "boxlist",
    version: "2.5",
    author: "AkHi",
    countDown: 5,
    role: 2,
    description: "Group list and management with optional notification before leave",
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

    msg += "💡 [number/all + L] -> Simple Leave\n💡 [number/all + L + noti + text] -> Message then Leave\n💡 [number/all + text] -> Simple Notify";

    return api.sendMessage(msg, event.threadID, (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        messageID: info.messageID,
        author: event.senderID,
        list
      });
    }, event.messageID);
  },

  onReply: async function ({ api, event, Reply, threadsData }) {
    const { author, list } = Reply;
    if (event.senderID != author) return;

    const input = event.body.trim();
    const args = input.split(/\s+/);
    const action = args[0].toLowerCase();
    
    const premiumStyle = (text) => `✨ 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 ✨\n━━━━━━━━━━━━━━━━━━\n\n${text}\n\n━━━━━━━━━━━━━━━━━━\n👤 𝐀𝐝𝐦𝐢𝐧: AkHi`;

    // ফাংশন: মেসেজ পাঠানো এবং লিভ নেওয়া
    const handleLeave = async (threadID, threadName, msgContent) => {
      try {
        if (msgContent) {
          await api.sendMessage(premiumStyle(msgContent), threadID);
        }
        await api.removeUserFromGroup(api.getCurrentUserID(), threadID);
        return true;
      } catch (e) {
        console.error(`Error in ${threadID}:`, e);
        return false;
      }
    };

    // ১. সব গ্রুপ থেকে লিভ নেওয়া (all L / all L noti message)
    if (action === "all" && args[1]?.toLowerCase() === "l") {
      let messageToSend = null;
      if (args[2]?.toLowerCase() === "noti") {
        messageToSend = args.slice(3).join(" ");
      }
      
      api.sendMessage("⏳ Processing leave from all groups, Ma'am...", event.threadID);
      for (const group of list) {
        await handleLeave(group.threadID, group.threadName, messageToSend);
      }
      return api.sendMessage("✅ Ma'am, successfully processed all groups.", event.threadID);
    }

    // ২. সব গ্রুপে সাধারণ মেসেজ পাঠানো (all message)
    if (action === "all" && args[1]?.toLowerCase() !== "l") {
      const messageContent = args.slice(1).join(" ");
      api.sendMessage("⏳ Sending notification to all groups...", event.threadID);
      for (const group of list) {
        try { await api.sendMessage(premiumStyle(messageContent), group.threadID); } catch (e) {}
      }
      return api.sendMessage("✅ Ma'am, notification sent to all active groups.", event.threadID);
    }

    // ৩. নির্দিষ্ট গ্রুপ থেকে লিভ (number + L / number + L noti message)
    if (!isNaN(action) && args[1]?.toLowerCase() === "l") {
      const index = parseInt(action) - 1;
      if (list[index]) {
        const group = list[index];
        let messageToSend = null;
        if (args[2]?.toLowerCase() === "noti") {
          messageToSend = args.slice(3).join(" ");
        }
        
        const success = await handleLeave(group.threadID, group.threadName, messageToSend);
        if (success) {
          return api.sendMessage(`✅ Ma'am, left from "${group.threadName}" successfully.`, event.threadID);
        } else {
          return api.sendMessage(`❌ Ma'am, I couldn't leave "${group.threadName}". Maybe I'm not there anymore.`, event.threadID);
        }
      }
    }

    // ৪. নির্দিষ্ট গ্রুপে সাধারণ মেসেজ পাঠানো (number + message)
    if (!isNaN(action)) {
      const index = parseInt(action) - 1;
      if (list[index]) {
        const group = list[index];
        const messageContent = args.slice(1).join(" ");
        try {
          await api.sendMessage(premiumStyle(messageContent), group.threadID);
          return api.sendMessage(`✅ Notification sent to: ${group.threadName}`, event.threadID);
        } catch (e) {
          return api.sendMessage(`❌ Failed to send message to ${group.threadName}.`, event.threadID);
        }
      }
    }

    return api.sendMessage("⚠️ Wrong format! Please use: [number L noti message] or [all L noti message]", event.threadID);
  }
};

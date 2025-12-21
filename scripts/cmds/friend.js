const axios = require("axios");

module.exports = {
  config: {
    name: "accept",
    aliases: ["acp", "accept"],
    version: "1.0.5",
    role: 2, // শুধুমাত্র অ্যাডমিন ব্যবহার করতে পারবে
    author: "AkHi",
    description: "Manage friend requests with Reply",
    category: "admin",
    guide: {
      en: "{pn} [list] - To see requests\nReply with: '1 add', '1 remove', 'add all', or 'remove all'"
    },
    countDown: 5
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID } = event;

    try {
      // পেন্ডিং ফ্রেন্ড রিকোয়েস্ট লিস্ট নেওয়া
      const listRequest = await api.getFriendRequests();
      
      if (listRequest.length === 0) {
        return api.sendMessage("AkHi Ma'am, বর্তমানে কোনো ফ্রেন্ড রিকোয়েস্ট নেই। 🥺", threadID, messageID);
      }

      // ১০টি লেটেস্ট রিকোয়েস্ট নেওয়া (নতুনগুলো আগে)
      const requests = listRequest.slice(0, 10);
      let msg = "✨ পেন্ডিং ফ্রেন্ড রিকোয়েস্ট লিস্ট (সর্বশেষ ১০টি) ✨\n" + "━".repeat(20) + "\n";

      requests.forEach((user, index) => {
        msg += `${index + 1}. নাম: ${user.name}\nID: ${user.userID}\n\n`;
      });

      msg += "━".repeat(20) + "Reply with add/remove and number";

      return api.sendMessage(msg, threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          author: event.senderID,
          requests: requests // রিকোয়েস্টগুলো ক্যাশে সেভ রাখা হলো
        });
      }, messageID);

    } catch (e) {
      return api.sendMessage("Error: " + e.message, threadID, messageID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    const { threadID, messageID, body, senderID } = event;
    const { requests } = Reply;

    if (senderID != Reply.author) return; // যে কমান্ড দিয়েছে শুধু সে ই রিপ্লাই দিতে পারবে

    const input = body.toLowerCase().trim();

    try {
      // ১. সব একসেপ্ট (add all)
      if (input === "add all") {
        api.sendMessage("AkHi Ma'am, Request accept on the way", threadID);
        for (let user of requests) {
          await api.handleFriendRequest(user.userID, true);
        }
        return api.sendMessage("✅ ${user.name} Request accept successfully", threadID, messageID);
      }

      // ২. সব ডিলেট (remove all)
      if (input === "remove all") {
        api.sendMessage("AkHi Ma'am, Request Delete on the way", threadID);
        for (let user of requests) {
          await api.handleFriendRequest(user.userID, false);
        }
        return api.sendMessage("❌ Request delete successfully Ma'am", threadID, messageID);
      }

      // ৩. নির্দিষ্ট রিকোয়েস্ট (যেমন: 1 add বা 1 remove)
      const match = input.match(/^(\d+)\s+(add|remove)$/);
      if (match) {
        const index = parseInt(match[1]) - 1;
        const action = match[2];

        if (index >= 0 && index < requests.length) {
          const user = requests[index];
          const isAccept = action === "add";

          api.handleFriendRequest(user.userID, isAccept, (err) => {
            if (err) return api.sendMessage("Error: " + err.errorDescription, threadID, messageID);
            return api.sendMessage(`${isAccept ? "✅ Accept" : "❌ Delete"} successfully: ${user.name}`, threadID, messageID);
          });
        } else {
          return api.sendMessage("❌ Wrong! Reply with correct number।", threadID, messageID);
        }
      } else {
        return api.sendMessage("❌ Wrong format! usage: '1 add' or 'add all'", threadID, messageID);
      }

    } catch (e) {
      return api.sendMessage("Error: " + e.message, threadID, messageID);
    }
  }
};

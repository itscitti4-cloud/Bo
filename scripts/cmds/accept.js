const axios = require("axios");

module.exports = {
  config: {
    name: "accept",
    aliases: ["acp"],
    version: "1.0.6",
    role: 2, 
    author: "AkHi",
    description: "Manage friend requests",
    category: "admin",
    guide: {
      en: "{pn} add <uid> or {pn} remove <uid>"
    },
    countDown: 5
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const action = args[0]?.toLowerCase();
    const uid = args[1];

    if (!action || !uid) {
      return api.sendMessage("❌ usage: !accept add <UID> অথবা !accept remove <UID>", threadID, messageID);
    }

    try {
      const isAccept = action === "add" || action === "accept";
      
      api.handleFriendRequest(uid, isAccept, (err) => {
        if (err) {
          return api.sendMessage(`❌ Error, bcz the out of the list\nError: ${err.errorDescription || err.message}`, threadID, messageID);
        }
        return api.sendMessage(`✅ ${isAccept ? "Accept" : "Remove"} Successfully! UID: ${uid}`, threadID, messageID);
      });

    } catch (e) {
      return api.sendMessage("Error: " + e.message, threadID, messageID);
    }
  }
};

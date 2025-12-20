module.exports = {
  config: {
    name: "logNotification",
    version: "1.0.0",
    author: "AkHi"
  },

  onChat: async function ({ api, event }) {
    const { threadID, logMessageType, logMessageData, author } = event;
    const logThreadID = "আপনার_লগ_গ্রুপের_আইডি_এখানে"; // আপনার লগ গ্রুপ আইডি

    // যদি বট নতুন গ্রুপে জয়েন করে
    if (logMessageType === "log:subscribe") {
      if (logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
        
        const threadInfo = await api.getThreadInfo(threadID);
        const { threadName } = threadInfo;

        const msg = `╭───『 𝗕𝗢𝗧 𝗟𝗢𝗚 』───⬡\n` +
                    `| 📝 𝗦𝘁𝗮𝘁𝘂𝘀: Joined New Group\n` +
                    `| 👥 𝗚𝗿𝗼𝘂𝗽: ${threadName || "No Name"}\n` +
                    `| 🆔 𝗜𝗗: ${threadID}\n` +
                    `| 👤 𝗔𝗱𝗱𝗲𝗱 𝗕𝘆: ${author}\n` +
                    `╰───────────────⬡`;

        return api.sendMessage(msg, logThreadID);
      }
    }
    
    // যদি কেউ বটকে গ্রুপ থেকে বের করে দেয়
    if (logMessageType === "log:unsubscribe") {
       if (logMessageData.leftParticipantFbId == api.getCurrentUserID()) {
         const msg = `╭───『 𝗕𝗢𝗧 𝗟𝗢𝗚 』───⬡\n` +
                     `| 📝 𝗦𝘁𝗮𝘁𝘂𝘀: Kicked/Left from Group\n` +
                     `| 🆔 𝗜𝗗: ${threadID}\n` +
                     `╰───────────────⬡`;
         return api.sendMessage(msg, logThreadID);
       }
    }
  }
};

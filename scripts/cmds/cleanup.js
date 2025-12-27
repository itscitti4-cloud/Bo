module.exports = {
  config: {
    name: "cleanup",
    version: "1.0.0",
    author: "AkHi",
    countDown: 10,
    role: 1, // Only group admins can use this
    shortDescription: "Remove inactive members from the group.",
    longDescription: "Identify and remove members who haven't sent any messages in the last specified days.",
    category: "admin",
    guide: "{pn} <days> (e.g., !cleanup 30)"
  },

  onStart: async function ({ api, event, args, message, threadsData }) {
    const { threadID, senderID } = event;
    const days = parseInt(args[0]);

    // 1. Check if days are provided correctly
    if (isNaN(days) || days <= 0) {
      return message.reply("Please provide a valid number of days. Usage: !cleanup <days> (e.g., !cleanup 30)");
    }

    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const { userInfo, adminIDs } = threadInfo;
      const threadData = await threadsData.get(threadID);
      const memberStats = threadData.members || {}; // Accessing member stats from GoatBot database

      const inactiveMembers = [];
      const currentTime = Date.now();
      const threshold = days * 24 * 60 * 60 * 1000;

      // 2. Identifying inactive members
      for (const user of userInfo) {
        const userID = user.id;
        const lastMessageTime = memberStats[userID]?.lastMessageDate || 0;

        // Don't count admins or the bot itself as inactive
        const isAdmin = adminIDs.some(admin => admin.id === userID);
        const isBot = userID === api.getCurrentUserID();

        if (!isAdmin && !isBot && (currentTime - lastMessageTime > threshold)) {
          inactiveMembers.push(userID);
        }
      }

      if (inactiveMembers.length === 0) {
        return message.reply(`Excellent! No inactive members found in the last ${days} days.`);
      }

      message.reply(`Found ${inactiveMembers.length} inactive members. Cleaning up... This may take a moment.`);

      // 3. Removing members one by one
      let count = 0;
      for (const userID of inactiveMembers) {
        try {
          await api.removeUserFromGroup(userID, threadID);
          count++;
          // Adding a small delay to avoid spamming Facebook's server
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (e) {
          console.error(`Failed to remove user ${userID}:`, e);
        }
      }

      return message.reply(`✅ Cleanup complete! Removed ${count} inactive members from the group.`);

    } catch (error) {
      console.error(error);
      return message.reply("An error occurred while trying to cleanup. Ensure I have admin permissions.");
    }
  }
};
      

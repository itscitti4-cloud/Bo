const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "unseenkick",
    aliases: ["uns", "unk"],
    version: "1.2",
    author: "AkHi",
    countDown: 5,
    role: 0,
    shortDescription: "List and kick inactive members",
    longDescription: "View members who haven't seen messages and kick them based on inactivity days.",
    category: "admin",
    guide: "{pn} or {pn} <days>"
  },

  onStart: async function ({ api, event, args, message, usersData, threadsData, role }) {
    const { threadID, messageID, senderID } = event;
    const threadInfo = await threadsData.get(threadID);
    
    const isGroupAdmin = threadInfo.adminIDs.includes(senderID);
    const isBotAdmin = role >= 2;

    if (!isGroupAdmin && !isBotAdmin) {
      return message.reply("❌ | You must be a Group Admin or Bot Admin to use this command.");
    }

    const now = Date.now();
    const inactiveMembers = [];
    
    // --- ফিক্স করা লুপ ---
    for (const memberID of threadInfo.members) {
      // বটের নিজের আইডি বাদ দেওয়া
      if (memberID == api.getCurrentUserID()) continue;

      try {
        // এখানে নিশ্চিত করা হয়েছে যেন শুধু ID স্ট্রিং হিসেবে যায়
        const userData = await usersData.get(memberID.toString()); 
        
        if (!userData) continue;

        const lastSeen = userData.lastSeen || 0; 
        const diff = now - lastSeen;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        inactiveMembers.push({
          id: memberID,
          name: userData.name || "Facebook User",
          lastSeen: lastSeen,
          days: days,
          lastMsg: userData.lastMessage || "No message recorded"
        });
      } catch (e) {
        console.error("Error fetching user data for: " + memberID);
      }
    }

    // !unk <days> লজিক
    if (event.body.startsWith("!unk") && args[0]) {
      const dayLimit = parseInt(args[0]);
      if (isNaN(dayLimit) || dayLimit < 1 || dayLimit > 7) {
        return message.reply("❌ | Please provide a day between 1 to 7.");
      }

      const toKick = inactiveMembers.filter(m => m.days >= dayLimit);
      if (toKick.length === 0) return message.reply(`✅ | No members found inactive for ${dayLimit} days.`);

      let kickCount = 0;
      for (const user of toKick) {
        try {
          if (threadInfo.adminIDs.includes(user.id)) continue;
          await api.removeUserFromGroup(user.id, threadID);
          kickCount++;
        } catch (e) { }
      }
      return message.reply(`🧹 | Kicked ${kickCount} members who were inactive for ${dayLimit}+ days.`);
    }

    // !uns লজিক
    inactiveMembers.sort((a, b) => a.lastSeen - b.lastSeen);
    let msg = "📊 [ INACTIVE MEMBERS LIST ] 📊\n━━━━━━━━━━━━━━━━━━\n";
    
    const displayList = inactiveMembers.slice(0, 20);
    if (displayList.length === 0) return message.reply("✅ | Everyone in this group is active!");

    displayList.forEach((user, index) => {
      const time = user.lastSeen === 0 ? "Never" : moment(user.lastSeen).tz("Asia/Dhaka").format("DD/MM/YYYY hh:mm A");
      msg += `${index + 1}. ${user.name}\n🕒 Last Seen: ${time}\n💬 Last Msg: ${user.lastMsg}\n🆔 ID: ${user.id}\n━━━━━━━━━━━━━━━━━━\n`;
    });

    msg += "\n💡 Reply with '<number> kick' to remove a specific user.";
    
    return message.reply(msg, (err, info) => {
      if (err) return;
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        messageID: info.messageID,
        author: senderID,
        inactiveMembers: displayList
      });
    });
  },

  onReply: async function ({ api, event, Reply, message }) {
    const { body, senderID, threadID } = event;
    if (senderID !== Reply.author) return;

    const input = body.toLowerCase();
    if (input.includes("kick")) {
      const num = parseInt(input.split(" ")[0]);
      const target = Reply.inactiveMembers[num - 1];

      if (!target) return message.reply("❌ | Invalid number from the list.");

      try {
        await api.removeUserFromGroup(target.id, threadID);
        return message.reply(`✅ | Successfully kicked ${target.name} from the group.`);
      } catch (e) {
        return message.reply("❌ | Failed to kick. Make sure the bot is an admin.");
      }
    }
  }
};
                                                       

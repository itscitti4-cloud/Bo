const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "setgrp",
    version: "2.1",
    author: "AkHi",
    countDown: 5,
    role: 1, // 0 = All, 1 = Admin/Super Admin
    description: "Change group name, emoji, theme, and cover photo.",
    category: "Box",
    guide: "{p}setgrp [name] - Change group name\n" +
          "{p}setgrp tm [reply to photo] - Set custom theme\n" +
          "{p}setgrp ej [emoji] - Set group emoji\n" +
          "{p}setgrp img [reply to photo] - Set group cover"
  },

  onStart: async function ({ api, event, args, message }) {
    const { threadID, messageID, type, messageReply } = event;
    const action = args[0]?.toLowerCase();

    try {
      // বট অ্যাডমিন কি না চেক করা
      const threadInfo = await api.getThreadInfo(threadID);
      if (!threadInfo.adminIDs.some(item => item.id == api.getCurrentUserID())) {
        return message.reply("❌ Bot must be an admin of this group to use this command.");
      }

      if (!action) {
        return message.reply("Please provide a name or a valid sub-command (tm, ej, img).");
      }

      // 1. Set Group Name: !setgrp <name>
      if (action !== "tm" && action !== "ej" && action !== "img") {
        const newName = args.join(" ");
        await api.setTitle(newName, threadID);
        return message.reply(`✅ Group name has been changed to: ${newName}`);
      }

      // 2. Set Custom Theme: !setgrp tm (Reply to image)
      if (action === "tm") {
        if (type !== "message_reply" || !messageReply.attachments[0] || messageReply.attachments[0].type !== "photo") {
          return message.reply("Please reply to a photo to set it as a custom theme.");
        }
        const imgUrl = messageReply.attachments[0].url;
        await api.setThreadTheme(imgUrl, threadID); 
        return message.reply("✅ Custom theme has been applied successfully.");
      }

      // 3. Set Emoji: !setgrp ej <emoji>
      if (action === "ej") {
        const emoji = args[1];
        if (!emoji) return message.reply("Please provide an emoji (e.g., !setgrp ej 🔥).");
        await api.setEmoji(emoji, threadID);
        return message.reply(`✅ Group emoji has been changed to: ${emoji}`);
      }

      // 4. Set Group Cover Photo: !setgrp img (Reply to image)
      if (action === "img") {
        if (type !== "message_reply" || !messageReply.attachments[0] || messageReply.attachments[0].type !== "photo") {
          return message.reply("Please reply to a photo to set it as the group cover.");
        }

        const imgUrl = messageReply.attachments[0].url;
        const cacheDir = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
        
        const filePath = path.join(cacheDir, `group_cover_${threadID}.png`);
        
        const response = await axios.get(imgUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(filePath, Buffer.from(response.data, "utf-8"));

        await api.changeGroupImage(fs.createReadStream(filePath), threadID);
        
        setTimeout(() => { if(fs.existsSync(filePath)) fs.unlinkSync(filePath); }, 2000);
        
        return message.reply("✅ Group cover photo has been updated.");
      }

    } catch (error) {
      console.error(error);
      return message.reply("❌ Failed to update. Ensure the bot is admin and not restricted by Facebook.");
    }
  }
};

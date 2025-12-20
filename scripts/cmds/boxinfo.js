const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "boxinfo",
    version: "1.1.0",
    author: "AkHi",
    countDown: 5,
    role: 0,
    category: "information",
    shortDescription: {
      en: "Displays full information about the group with cover photo."
    },
    longDescription: {
      en: "This command provides details like member count, gender distribution, admin list, and group image."
    },
    guide: {
      en: "{p}boxinfo"
    }
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID } = event;
    const cachePath = __dirname + `/cache/group_${threadID}.png`;

    try {
      // গ্রুপের তথ্য সংগ্রহ
      const threadInfo = await api.getThreadInfo(threadID);
      const { threadName, participantIDs, approvalMode, emoji, adminIDs, messageCount, imageSrc } = threadInfo;

      let maleCount = 0;
      let femaleCount = 0;

      // ইউজারদের তথ্য সংগ্রহ
      const usersData = await api.getUserInfo(participantIDs);
      
      for (const id in usersData) {
        const gender = usersData[id].gender;
        if (gender === 2 || gender === "male") maleCount++; 
        else if (gender === 1 || gender === "female") femaleCount++;
      }

      // অ্যাডমিনদের নাম সংগ্রহ
      let adminNames = [];
      const adminData = await api.getUserInfo(adminIDs.map(item => item.id));
      for (const id in adminData) {
        adminNames.push(adminData[id].name);
      }

      const approvalStatus = approvalMode ? "On" : "Off";

      const infoMessage = `
━━━ 𝗕𝗼𝘅 𝗜𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻 ━━━
📝 Box Name: ${threadName || "No Name"}
🆔 Box Id: ${threadID}
🛡️ Approval: ${approvalStatus}
🎨 Emoji: ${emoji || "👍"}
👥 Members: ${participantIDs.length}
👨 Male: ${maleCount} | 👩 Female: ${femaleCount}
👑 Total Admins: ${adminIDs.length}
📜 Admin List: ${adminNames.join(", ")}
📊 Total Messages: ${messageCount}
👤 Bot Owner: Lubna Jannat
━━━━━━━━━━━━━━━━━━━━`.trim();

      // কভার ফটো হ্যান্ডেলিং
      if (imageSrc) {
        const response = await axios.get(imageSrc, { responseType: 'arraybuffer' });
        fs.writeFileSync(cachePath, Buffer.from(response.data, 'utf-8'));

        return api.sendMessage({
          body: infoMessage,
          attachment: fs.createReadStream(cachePath)
        }, threadID, () => {
          if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath); // ফাইল ডিলিট করা
        }, messageID);
      } else {
        // ছবি না থাকলে শুধু মেসেজ পাঠাবে
        return api.sendMessage(infoMessage, threadID, messageID);
      }

    } catch (error) {
      console.error(error);
      return api.sendMessage("AkHi Ma'am, groups information fetch করতে সমস্যা হয়েছে। 🥺", threadID, messageID);
    }
  }
};

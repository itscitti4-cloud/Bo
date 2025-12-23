const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "love",
    version: "2.0",
    author: "AkHi",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "Create a love ship image of two users"
    },
    category: "fun",
    guide: {
      en: "{p}love @user1 @user2"
    }
  },

  onStart: async function ({ api, event, message }) {
    const { mentions } = event;
    const mentionIDs = Object.keys(mentions);

    if (mentionIDs.length < 2) {
      return message.reply("❌ | অনুগ্রহ করে দুজনকে মেনশন করুন। উদাহরণস্বরূপ:\n!love @user1 @user2");
    }

    const uid1 = mentionIDs[0];
    const uid2 = mentionIDs[1];

    // প্রোফাইল পিকচার ইউআরএল (অ্যাক্সেস টোকেন ছাড়াই কাজ করবে)
    const avatar1 = `https://graph.facebook.com/${uid1}/picture?width=512&height=512`;
    const avatar2 = `https://graph.facebook.com/${uid2}/picture?width=512&height=512`;

    const cachePath = path.join(__dirname, "cache");
    if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);
    const filePath = path.join(cachePath, `ship_${uid1}_${uid2}.png`);

    try {
      //Canvas বা নতুন API ব্যবহার করে ছবি জেনারেট করা
      const res = await axios.get(`https://api.canvasbot.xyz/api/ship?avatar1=${encodeURIComponent(avatar1)}&avatar2=${encodeURIComponent(avatar2)}`, {
        responseType: "arraybuffer"
      });

      fs.writeFileSync(filePath, Buffer.from(res.data, "utf-8"));

      message.reply({
        body: `💞 ভালোবাসার বন্ধনে আবদ্ধ:\n${mentions[uid1].replace("@", "")} ❤️ ${mentions[uid2].replace("@", "")}`,
        attachment: fs.createReadStream(filePath)
      }, () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

    } catch (err) {
      console.error(err);
      message.reply("❌ | ইমেজ জেনারেট করতে সমস্যা হয়েছে। অন্য এপিআই বা পরে চেষ্টা করুন।");
    }
  }
};

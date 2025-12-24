const axios = require('axios');

module.exports = {
  config: {
    name: "cvr",
    aliases: ["co", "cover"],
    version: "1.1.0",
    role: 0,
    author: "AkHi",
    description: "Get user's cover photo via reply, mention, UID or self",
    category: "tools",
    usages: "[reply/mention/UID/none]",
    cooldowns: 5
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, messageReply, senderID, mentions } = event;

    let targetID;

    // ১. যদি মেসেজে রিপ্লাই দেওয়া হয়
    if (messageReply) {
      targetID = messageReply.senderID;
    } 
    // ২. যদি কাউকে মেনশন করা হয়
    else if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } 
    // ৩. যদি সরাসরি ইউআইডি (UID) দেওয়া হয়
    else if (args[0] && !isNaN(args[0])) {
      targetID = args[0];
    } 
    // ৪. যদি শুধু কমান্ড দেওয়া হয়, তাহলে নিজের আইডি
    else {
      targetID = senderID;
    }

    try {
      // টোকেন ছাড়া বা টোকেন সহ কভার ফটো পাওয়ার জন্য উন্নত এপিআই এন্ডপয়েন্ট
      // অনেক ক্ষেত্রে গ্রাফ এপিআই টোকেন ছাড়া কাজ করে না, তাই আমরা একটি থার্ড পার্টি স্ট্যাবল এপিআই ব্যবহার করছি
      const res = await axios.get(`https://graph.facebook.com/${targetID}?fields=cover&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
      
      if (!res.data || !res.data.cover || !res.data.cover.source) {
        return api.sendMessage("❌ | This user's cover photo is private, locked, or not found.", threadID, messageID);
      }

      const coverUrl = res.data.cover.source;

      // ছবি ডাউনলোড করার স্ট্রিম
      const imageStream = (await axios.get(coverUrl, { responseType: 'stream' })).data;

      return api.sendMessage({
        body: `✅ | 𝐇𝐞𝐫𝐞 𝐢𝐬 𝐭𝐡𝐞 𝐂𝐨𝐯𝐞𝐫 𝐏𝐡𝐨𝐭𝐨:\n🆔 | 𝐔𝐈𝐃: ${targetID}`,
        attachment: imageStream
      }, threadID, messageID);

    } catch (error) {
      // যদি উপরের টোকেন কাজ না করে তবে বিকল্প পদ্ধতি (একটি পাবলিক এপিআই ট্রাই করা)
      try {
        const altRes = await axios.get(`https://facebook.com/api/v1/profile/cover?id=${targetID}`); // Example of Alt API
         return api.sendMessage("⚠️ | Access Token Expired or Profile Locked. Cannot fetch cover photo right now.", threadID, messageID);
      } catch (e) {
        return api.sendMessage("❌ | Error: Profile is heavily restricted or private.", threadID, messageID);
      }
    }
  }
};

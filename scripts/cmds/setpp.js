const axios = require("axios");

module.exports = {
  config: {
    name: "setpp",
    version: "1.0.0",
    role: 2, // ২ মানে শুধুমাত্র বটের প্রধান এডমিনরা পারবে
    author: "AkHi",
    description: "Set Facebook profile picture",
    category: "admin",
    guide: {
        en: "[Reply to an image]"
    },
    countDown: 5
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, messageReply } = event;

    // ১. চেক করা হচ্ছে রিপ্লাই দেওয়া হয়েছে কি না এবং সেটি ইমেজ কি না
    if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0 || messageReply.attachments[0].type !== "photo") {
      return api.sendMessage("AkHi Ma'am, দয়া করে একটি ছবির রিপ্লাইতে কমান্ডটি লিখুন।", threadID, messageID);
    }

    try {
      const imageUrl = messageReply.attachments[0].url;

      // ২. ইমেজ ডাটা সংগ্রহ
      const response = await axios.get(imageUrl, { responseType: 'stream' });

      // ৩. প্রোফাইল পিকচার পরিবর্তন
      // অনেক FCA ভার্সনে changeAvatar এর প্রথম আর্গুমেন্ট হিসেবে স্ট্রিম দিতে হয়
      await api.changeAvatar(response.data, "", 0, (err) => {
        if (err) {
          console.error(err);
          return api.sendMessage("AkHi Ma'am, I'm so sorry, set profile failed 🥺", threadID, messageID);
        }
        // ৪. সফল হওয়ার মেসেজ
        return api.sendMessage("AkHi Ma'am, Change bot Profile successfully ✅", threadID, messageID);
      });

    } catch (error) {
      console.error(error);
      return api.sendMessage("AkHi Ma'am, something went wrong 🥺", threadID, messageID);
    }
  }
};

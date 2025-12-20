module.exports = {
  config: {
    name: "post",
    aliases: ["fbpost"],
    version: "1.0",
    author: "AkHi",
    countDown: 5,
    role: 2, // শুধুমাত্র বট এডমিন পোস্ট করতে পারবে
    shortDescription: "Post on Facebook Timeline",
    longDescription: "Allows the bot to post a status on its own Facebook profile.",
    category: "Social",
    guide: {
      en: "{p}post <your caption>",
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const content = args.join(" ");

    // ১. চেক করা হচ্ছে ক্যাপশন দেওয়া হয়েছে কি না
    if (!content) {
      return api.sendMessage("AkHi Ma'am, দয়া করে পোস্টের জন্য একটি ক্যাপশন লিখুন।", threadID, messageID);
    }

    try {
      // ২. প্রোফাইলে পোস্ট করার ফাংশন
      // দ্রষ্টব্য: api.createPost অনেক লাইব্রেরিতে সরাসরি সাপোর্ট করে
      await api.createPost(content, (err, data) => {
        if (err) {
          console.error(err);
          return api.sendMessage("AkHi Ma'am, I'm so sorry, post failed🥺", threadID, messageID);
        }
        
        // ৩. সফল হলে রিপ্লাই মেসেজ
        return api.sendMessage("AkHi Ma'am, Post done successfully ✅", threadID, messageID);
      });

    } catch (error) {
      console.error(error);
      return api.sendMessage("AkHi Ma'am, I'm so sorry, something went wrong 🥺", threadID, messageID);
    }
  }
};

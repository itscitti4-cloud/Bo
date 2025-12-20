module.exports = {
  config: {
    name: "post",
    aliases: ["fbpost"],
    version: "1.5",
    author: "AkHi",
    role: 2, // শুধুমাত্র বট এডমিন
    category: "Social",
    countDown: 10,
    shortDescription: "Post on Facebook profile",
    guide: {
      en: "{p}post <caption text>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const content = args.join(" ");

    if (!content) {
      return api.sendMessage("AkHi Ma'am, দয়া করে পোস্টের জন্য একটি ক্যাপশন লিখুন।", threadID, messageID);
    }

    try {
      // কিছু FCA ভার্সনে createPost এর বদলে handleCreatePost বা সরাসরি এপিআই কল লাগে।
      // এখানে সবথেকে প্রচলিত মেথডটি ব্যবহার করা হয়েছে।
      
      const postResponse = await api.createPost(content);

      // সফল হলে (যদি এরর না আসে)
      return api.sendMessage("AkHi Ma'am, Post done successfully ✅", threadID, messageID);

    } catch (error) {
      // যদি api.createPost সাপোর্ট না করে
      console.error("Post Error:", error);
      
      if (error.message.includes("is not a function")) {
          return api.sendMessage("AkHi Ma'am, দুঃখিত! আপনার বটের FCA লাইব্রেরিটি সরাসরি টাইমলাইন পোস্ট সাপোর্ট করে না। 🥺", threadID, messageID);
      }
      
      return api.sendMessage(`AkHi Ma'am, I'm so sorry, post failed 🥺\nError: ${error.message}`, threadID, messageID);
    }
  }
};

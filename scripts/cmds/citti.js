const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = {
  config: {
    name: "citti",
    version: "6.0.0",
    author: "AkHi",
    role: 0,
    category: "Chat",
    guide: "{pn} <msg>",
    countDown: 2
  },

  onChat: async function ({ api, event }) {
    const { threadID, messageID, body, messageReply, senderID } = event;
    
    // মেসেজ না থাকলে বা বটের নিজের মেসেজ হলে রিটার্ন করবে
    if (!body || senderID == api.getCurrentUserID()) return;

    const keywords = ["citti", "চিট্টি", "বেবি", "হিনাতা", "বট", "bby", "baby", "hinata", "bot"];
    const bodyLower = body.toLowerCase();
    
    // কি-ওয়ার্ড দিয়ে শুরু হয়েছে কি না বা বটকে রিপ্লাই দেওয়া হয়েছে কি না
    const matchedKeyword = keywords.find(word => bodyLower.startsWith(word));
    const isReplyToBot = messageReply && messageReply.senderID == api.getCurrentUserID();

    if (matchedKeyword || isReplyToBot) {
      let prompt = matchedKeyword ? body.slice(matchedKeyword.length).trim() : body.trim();

      // যদি শুধু নাম ধরে ডাকে (কোনো প্রশ্ন না থাকে)
      if (matchedKeyword && !prompt) {
        const nicknames = {
            "citti": "জি! আমি Citti বলছি।",
            "চিট্টি": "জি জানু, বলো কী সাহায্য করতে পারি?",
            "baby": "জি বেবি! বলো শুনছি।",
            "bby": "জি সোনা! বলো কী হয়েছে?",
            "hinata": "হ্যাঁ, আমি হিনাতা। তোমাকে কীভাবে সাহায্য করতে পারি?",
            "bot": "জি, আমি একটি এআই বট।"
        };
        return api.sendMessage(nicknames[matchedKeyword] || "জি! আমি শুনছি।", threadID, messageID);
      }

      try {
        // Environment Variable থেকে কি নেওয়া হচ্ছে
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
          return console.error("Error: GEMINI_API_KEY is not set in Environment Variables!");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        
        // মডেল কনফিগারেশন এবং সিস্টেম ইন্সট্রাকশন
        const model = genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          systemInstruction: "Your name is Citti. Developed by Lubna Jannat AkHi. Reply in Bengali naturally. Keep answers helpful and friendly."
        });

        // এআই থেকে উত্তর জেনারেট করা
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // উত্তর পাঠানো
        api.sendMessage(text, threadID, messageID);

      } catch (error) {
        console.error("Gemini Error:", error.message);
        // ইউজারকে এরর মেসেজ দেখাবে না যাতে বট স্প্যাম না করে, শুধু কনসোলে থাকবে
      }
    }
  }
};

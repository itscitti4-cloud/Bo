const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = {
  config: {
    name: "citti",
    version: "6.0.0",
    author: "AkHi",
    role: 0,
    category: "ai",
    guide: "{pn} <প্রশ্ন>",
    countDown: 2
  },

  onChat: async function ({ api, event }) {
    const { threadID, messageID, body, messageReply, senderID } = event;
    if (!body || senderID == api.getCurrentUserID()) return;

    // ১. আপনার দেওয়া নামগুলোর তালিকা (Keywords)
    const keywords = ["citti", "চিট্টি", "বেবি", "হিনাতা", "বট", "bby", "baby", "hinata", "bot"];
    
    const bodyLower = body.toLowerCase();
    
    // ২. চেক করা: মেসেজের শুরুতে কোনো কি-ওয়ার্ড আছে কি না
    const matchedKeyword = keywords.find(word => bodyLower.startsWith(word));
    
    // ৩. চেক করা: বটের মেসেজে রিপ্লাই দেওয়া হয়েছে কি না
    const isReplyToBot = messageReply && messageReply.senderID == api.getCurrentUserID();

    if (matchedKeyword || isReplyToBot) {
      let prompt = "";

      if (matchedKeyword) {
        // কি-ওয়ার্ড টুকু বাদ দিয়ে বাকি অংশ প্রম্পট হিসেবে নেওয়া
        prompt = body.slice(matchedKeyword.length).trim();
      } else {
        // রিপ্লাই এর ক্ষেত্রে পুরো মেসেজটিই প্রম্পট
        prompt = body.trim();
      }

      // যদি শুধু নাম ধরে ডাকে (সাথে কোনো প্রশ্ন না থাকে)
      if (matchedKeyword && !prompt) {
        const nicknames = {
            "citti": "জি! আমি Citti বলছি।",
            "চিট্টি": "জি জানু, বলো কী সাহায্য করতে পারি?",
            "baby": "জি বেবি! বলো শুনছি।",
            "bby": "জি সোনা! বলো কী হয়েছে?",
            "hinata": "হ্যাঁ, আমি হিনাতা। তোমাকে কীভাবে সাহায্য করতে পারি?",
            "bot": "জি, আমি একটি এআই বট। আপনার প্রশ্নের উত্তর দিতে প্রস্তুত।"
        };
        const replyMsg = nicknames[matchedKeyword] || "জি! আমি শুনছি, বলুন আপনাকে কীভাবে সাহায্য করতে পারি?";
        return api.sendMessage(replyMsg, threadID, messageID);
      }

      try {
        // SDK সেটআপ
        const genAI = new GoogleGenerativeAI("AIzaSyBbFzulfEGJBL40T-P5kov0WlBL7cM9ip8");
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            // সিস্টেম ইন্সট্রাকশন যাতে বট নিজের নাম ও পরিচয় মনে রাখে
            systemInstruction: "Your name is Citti (or Hinata/Baby/Bot as called). Developed by Lubna Jannat AkHi. Always answer in a friendly and helpful way. If asked in Bengali, reply in Bengali."
        });

        // এআই জেনারেট কন্টেন্ট
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        api.sendMessage(text, threadID, messageID);

      } catch (error) {
        console.error("SDK Error:", error.message);
        // ৪২৯ বা ইন্টারনাল এরর হলে টার্মিনালে চেক করুন
      }
    }
  }
};

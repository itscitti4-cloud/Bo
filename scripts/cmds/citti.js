const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = {
  config: {
    name: "cittiChatAI", // নাম পরিবর্তন করা হয়েছে সংঘাত এড়াতে
    version: "6.0.1",
    author: "AkHi",
    role: 0,
    category: "Chat",
    guide: "{pn} <msg>",
    countDown: 0 
  },

  onChat: async function ({ api, event }) {
    const { threadID, messageID, body, messageReply, senderID } = event;
    if (!body || senderID == api.getCurrentUserID()) return;

    const keywords = ["citti", "চিট্টি", "বেবি", "হিনাতা", "বট", "bby", "baby", "hinata", "bot"];
    const bodyLower = body.toLowerCase().trim();
    
    // কি-ওয়ার্ড চেক
    const matchedKeyword = keywords.find(word => bodyLower.startsWith(word));
    const isReplyToBot = messageReply && messageReply.senderID == api.getCurrentUserID();

    if (matchedKeyword || isReplyToBot) {
      // যদি শুধু কি-ওয়ার্ড লিখে (যেমন: bby)
      if (matchedKeyword && bodyLower === matchedKeyword) {
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

      // Gemini AI পার্ট
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          systemInstruction: "Your name is Citti. Developed by Lubna Jannat Akhi. Answer in Bengali if asked in Bengali, in English if asked in English, or in Banglish if asked in Banglish (Banglish means:Write something that means in Bengali with English letters) Answers should be short and relevant."
        });

        const prompt = isReplyToBot ? body : body.slice(matchedKeyword.length).trim();
        if (!prompt) return;

        const result = await model.generateContent(prompt);
        api.sendMessage(result.response.text(), threadID, messageID);
      } catch (e) {
        console.error("Error:", e.message);
      }
    }
  }
};

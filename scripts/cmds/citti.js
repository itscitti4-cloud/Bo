const axios = require("axios");

module.exports = {
  config: {
    name: "citti",
    version: "2.6.0",
    role: 0,
    author: "AkHi and Sabu",
    description: "Citti AI fixed Gemini setup",
    category: "chat",
    guide: "{pn} <question>",
    countDown: 5
  },

  onChat: async function ({ api, event }) {
    const { threadID, messageID, body, messageReply } = event;
    
    const isCittiStart = body && body.toLowerCase().startsWith("citti");
    const isReplyToBot = messageReply && messageReply.senderID == api.getCurrentUserID();

    if (isCittiStart || isReplyToBot) {
      let prompt = isCittiStart ? body.slice(5).trim() : body;

      if (!prompt && isCittiStart) {
        return api.sendMessage("জি! আমি Citti বলছি। আপনাকে কীভাবে সাহায্য করতে পারি?", threadID, messageID);
      } else if (!prompt) return;

      try {
        const geminiConfig = global.config.GEMINI;
        const apiKey = geminiConfig.API_Key;
        const model = "gemini-2.5-flash"; // এপিআই-এর জন্য এটিই সবচেয়ে স্টেবল নাম
        const systemInstruction = geminiConfig.SystemInstruction;

        // এপিআই ইউআরএল এবং ডাটা ফরম্যাট পরিবর্তন করা হয়েছে
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const res = await axios.post(url, {
          contents: [{
            parts: [{ text: `${systemInstruction}\n\nUser: ${prompt}` }]
          }]
        });

        if (res.data && res.data.candidates && res.data.candidates[0].content) {
          const reply = res.data.candidates[0].content.parts[0].text;
          api.sendMessage(reply, threadID, messageID);
        } else {
          // যদি এপিআই থেকে কোনো টেক্সট না আসে
          api.sendMessage("গুগল এআই থেকে কোনো উত্তর পাওয়া যায়নি। দয়া করে আবার চেষ্টা করুন।", threadID, messageID);
        }

      } catch (error) {
        // টার্মিনালে আসল ভুলটি দেখার জন্য
        console.error("Gemini Error Details:", error.response ? JSON.stringify(error.response.data) : error.message);
        
        api.sendMessage("দুঃখিত, কানেকশনে সমস্যা হচ্ছে। দয়া করে আপনার API Key সঠিক কিনা চেক করুন।", threadID, messageID);
      }
    }
  }
};

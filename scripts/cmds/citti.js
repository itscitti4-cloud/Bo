const axios = require("axios");

module.exports = {
  config: {
    name: "citti",
    version: "2.0.0",
    role: 0,
    author: "AkHi and Sabu",
    description: "Citti AI bot with reply support",
    category: "chat",
    guide: "{pn} <question>",
    countDown: 5
  },

  onChat: async function ({ api, event, Threads }) {
    const { threadID, messageID, body, messageReply, senderID } = event;
    
    // ১. কন্ডিশন: যদি মেসেজ "citti" দিয়ে শুরু হয় অথবা যদি কেউ চিত্তির কোনো মেসেজে রিপ্লাই দেয়
    const isCittiStart = body && body.toLowerCase().startsWith("citti");
    const isReplyToBot = messageReply && messageReply.senderID == api.getCurrentUserID();

    if (isCittiStart || isReplyToBot) {
      let prompt = "";

      if (isCittiStart) {
        prompt = body.slice(5).trim();
      } else {
        prompt = body;
      }

      // যদি প্রশ্ন না থাকে
      if (!prompt && isCittiStart) {
        return api.sendMessage("জি! আমি Citti বলছি। আপনাকে কীভাবে সাহায্য করতে পারি?", threadID, messageID);
      } else if (!prompt) return;

      try {
        // config.json থেকে Gemini এর তথ্যগুলো নিচ্ছে
        const geminiConfig = global.config.GEMINI;
        const apiKey = geminiConfig.API_Key;
        const model = geminiConfig.Model || "gemini-1.5-flash";
        const systemInstruction = geminiConfig.SystemInstruction;

        // Gemini API কল (Google AI Studio)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const res = await axios.post(url, {
          contents: [
            {
              role: "user",
              parts: [{ text: `System Instruction: ${systemInstruction}\n\nUser Question: ${prompt}` }]
            }
          ]
        }, {
          headers: {
            "Content-Type": "application/json"
          }
        });

        const reply = res.data.candidates[0].content.parts[0].text;
        
        // উত্তরটি মেসেজ আকারে পাঠানো
        api.sendMessage(reply, threadID, messageID);

      } catch (error) {
        console.error("Gemini Error:", error.response ? error.response.data : error.message);
        api.sendMessage("দুঃখিত, এই মুহূর্তে আমি একটু ব্যস্ত আছি। আমার API Key বা ইন্টারনেট চেক করুন।", threadID, messageID);
      }
    }
  },

  onStart: async function ({ api, event, args }) {
    // এটি খালি রাখা হয়েছে কারণ prefix ছাড়া onChat-এ কাজ করবে
    api.sendMessage("অনুগ্রহ করে 'citti' লিখে আপনার প্রশ্নটি করুন।", event.threadID, event.messageID);
  }
};

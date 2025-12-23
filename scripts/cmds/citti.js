const axios = require("axios");

module.exports = {
  config: {
    name: "citti",
    version: "3.0.0",
    role: 0,
    author: "AkHi",
    description: "Gemini AI - No Prefix Support",
    category: "chat",
    guide: "{pn} <question>",
    countDown: 2
  },

  onChat: async function ({ api, event }) {
    const { threadID, messageID, body, messageReply } = event;
    if (!body) return;

    // ১. চেক করা: মেসেজ "citti" দিয়ে শুরু কি না অথবা বটের মেসেজে রিপ্লাই কি না
    const isCittiStart = body.toLowerCase().startsWith("citti");
    const isReplyToBot = messageReply && messageReply.senderID == api.getCurrentUserID();

    if (isCittiStart || isReplyToBot) {
      let prompt = isCittiStart ? body.slice(5).trim() : body;

      if (!prompt && isCittiStart) {
        return api.sendMessage("জি! আমি Citti বলছি। আপনাকে কীভাবে সাহায্য করতে পারি?", threadID, messageID);
      } else if (!prompt) return;

      try {
        // সরাসরি API Key বসিয়ে দিচ্ছি (config.json থেকে রিড করতে সমস্যা হতে পারে)
        const apiKey = "AIzaSyBbFzulfEGJBL40T-P5kov0WlBL7cM9ip8"; 
        const model = "gemini-1.5-flash"; 
        const systemInstruction = "You are Chitti. Developed by Lubna Jannat AkHi. Answer in Bengali if asked in Bengali, English if asked in English. Give short and direct answers.";

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const res = await axios.post(url, {
          contents: [{
            parts: [{ text: `System Instruction: ${systemInstruction}\n\nUser Question: ${prompt}` }]
          }]
        });

        if (res.data && res.data.candidates && res.data.candidates[0].content) {
          const replyText = res.data.candidates[0].content.parts[0].text;
          api.sendMessage(replyText, threadID, messageID);
        }

      } catch (error) {
        console.error("Gemini Direct Error:", error.response ? error.response.data : error.message);
        // যদি এপিআই কাজ না করে তবে টার্মিনালে মেসেজ আসবে
      }
    }
  },

  onStart: async function ({ api, event }) {
    api.sendMessage("অনুগ্রহ করে শুধু 'citti' লিখে প্রশ্ন করুন।", event.threadID, event.messageID);
  }
};
            

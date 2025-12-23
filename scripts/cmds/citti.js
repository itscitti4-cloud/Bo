const axios = require("axios");

module.exports = {
  config: {
    name: "citti", // কমান্ডের নাম এখন citti
    version: "1.0.5",
    role: 0,
    author: "AkHi",
    description: "Citti AI - ChatGPT based bot",
    category: "chat",
    guide: "{pn} <question>",
    countDown: 5
  },

  // এই অংশটি যোগ করা হয়েছে যাতে Prefix ছাড়া (যেমন: শুধু Citti লিখে) কাজ করে
  onChat: async function ({ api, event, args, Threads }) {
    const { threadID, messageID, body } = event;
    
    // যদি মেসেজটি "citti" দিয়ে শুরু হয় (ছোট হাত বা বড় হাতের অক্ষর যাই হোক)
    if (body && body.toLowerCase().startsWith("citti")) {
      const prompt = body.slice(5).trim(); // "citti" শব্দটি বাদ দিয়ে বাকি প্রশ্নটুকু নেবে

      if (!prompt) {
        return api.sendMessage("জি! আমি Citti বলছি। আপনাকে কীভাবে সাহায্য করতে পারি?", threadID, messageID);
      }

      try {
        // API Key আপনার config.json থেকে নিচ্ছে
        const apiKey = global.config.openAiApiKey; 

        const res = await axios.post("https://api.openai.com/v1/chat/completions", {
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "Your name is Citti. You are a helpful and friendly AI assistant." },
            { role: "user", content: prompt }
          ]
        }, {
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          }
        });

        const reply = res.data.choices[0].message.content;
        api.sendMessage(reply, threadID, messageID);
      } catch (error) {
        console.error(error);
        api.sendMessage("দুঃখিত, এই মুহূর্তে আমি একটু ব্যস্ত আছি। পরে চেষ্টা করবেন কি?", threadID, messageID);
      }
    }
  },

  // এটি সাধারণ কমান্ডের জন্য (যেমন: !citti)
  onStart: async function ({ api, event, args }) {
    // এটি খালি রাখা হয়েছে কারণ আমরা onChat ব্যবহার করছি Prefix ছাড়া কাজ করানোর জন্য
  }
};

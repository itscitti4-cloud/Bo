const axios = require("axios");

// যেসব নাম ধরে ডাকলে বট রিপ্লাই দিবে
const botNames = ["baby", "bby", "citti", "চিট্টি", "বেবি", "bot", "হিনাতা", "বট", "hinata"];

module.exports = {
  config: {
    name: "citti",
    version: "2.1.0",
    author: "AkHi",
    role: 0,
    category: "chat",
    shortDescription: "Chat with bot by name or reply",
    guide: {
      en: "Just call my name (baby/bot/citti) or reply to my message to chat!"
    },
    countDown: 0
  },

  // ১. অন-চ্যাট: কমান্ড ছাড়া নাম ধরে ডাকলে কাজ করবে
  onChat: async function ({ api, event }) {
    const { threadID, messageID, body, senderID } = event;
    if (!body) return;

    const input = body.toLowerCase();
    
    // চেক করা হচ্ছে মেসেজের শুরুতে বটের নাম আছে কি না
    const isCalled = botNames.some(name => input.startsWith(name));

    if (isCalled) {
      // নাম থেকে মেসেজটি আলাদা করা (যেমন: baby hello -> hello)
      let userMessage = input;
      for (const name of botNames) {
        if (input.startsWith(name)) {
          userMessage = input.replace(name, "").trim();
          break;
        }
      }

      // যদি শুধু নাম ধরে ডাকে (কোনো প্রশ্ন ছাড়া)
      if (!userMessage) {
          const funReplies = ["হুম বলো জানু!", "𝗕𝗯𝘆 না বলে 𝗕𝗼𝘄 বলো 😘", "Bolo baby❤️", "বেশি ডাকলে আম্মু বকা দিবে তো! 🥺"];
          const randomText = funReplies[Math.floor(Math.random() * funReplies.length)];
          return api.sendMessage(randomText, threadID, (err, info) => {
              global.GoatBot.onReply.set(info.messageID, {
                  commandName: this.config.name,
                  author: senderID
              });
          }, messageID);
      }

      // যদি নামের সাথে কিছু লিখে (যেমন: baby kemon acho)
      try {
          api.setMessageReaction("🪽", messageID, () => {}, true);
          const res = await axios.get(`https://api.samir.ltd/ai/gpt4?q=${encodeURIComponent(userMessage)}`);
          const botReply = res.data.answer || res.data.result;

          return api.sendMessage(botReply, threadID, (err, info) => {
              global.GoatBot.onReply.set(info.messageID, {
                  commandName: this.config.name,
                  author: senderID
              });
          }, messageID);
      } catch (e) {
          console.error(e);
      }
    }
  },

  // ২. অন-রিপ্লাই: বটের মেসেজে রিপ্লাই দিলে কন্টিনিউয়াস চ্যাট চলবে
  onReply: async function ({ api, event, Reply }) {
    const { threadID, messageID, body, senderID } = event;

    try {
      api.setMessageReaction("🔍", messageID, () => {}, true);
      
      // এপিআই কল
      const res = await axios.get(`https://api.samir.ltd/ai/gpt4?q=${encodeURIComponent(body)}`);
      const responseText = res.data.answer || res.data.result;

      return api.sendMessage(responseText, threadID, (err, info) => {
        // আবার অন-রিপ্লাই সেট করা যাতে চ্যাট চলতেই থাকে
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          author: senderID
        });
      }, messageID);
    } catch (error) {
      api.sendMessage("Sorry baby, brain slow hoye gese! 🥺", threadID, messageID);
    }
  },

  // ৩. সাধারণ কমান্ড হিসেবেও কাজ করবে
  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const prompt = args.join(" ");

    if (!prompt) return api.sendMessage("AkHi Ma'am, কি বলতে চান বলুন?", threadID, messageID);

    try {
      const res = await axios.get(`https://api.samir.ltd/ai/gpt4?q=${encodeURIComponent(prompt)}`);
      const result = res.data.answer || res.data.result;

      return api.sendMessage(result, threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          author: senderID
        });
      }, messageID);
    } catch (e) {
      return api.sendMessage("API Error!", threadID, messageID);
    }
  }
};

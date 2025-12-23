const axios = require('axios');
const API_ENDPOINT = 'https://metakexbyneokex.fly.dev/chat';

module.exports = {
  config: {
    name: "bby",
    version: "2.0.0",
    role: 0,
    author: "AkHi",
    description: "Chat with Meta Ai (Prefix-less with multiple nicknames)",
    category: "chat",
    usages: "[message] or call by name",
    cooldowns: 5
  },

  onChat: async function ({ api, event, message, Reply }) {
    const { threadID, messageID, body, senderID, messageReply } = event;
    if (!body || senderID == api.getCurrentUserID()) return;

    // ১. নামগুলোর তালিকা (Keywords)
    const keywords = ["citti", "চিট্টি", "বেবি", "হিনাতা", "বট", "bby", "baby", "hinata", "bot"];
    const bodyLower = body.toLowerCase();
    
    // চেক করা: মেসেজের শুরুতে কোনো কি-ওয়ার্ড আছে কি না
    const matchedKeyword = keywords.find(word => bodyLower.startsWith(word));
    // চেক করা: বটের মেসেজে রিপ্লাই দেওয়া হয়েছে কি না
    const isReplyToBot = messageReply && messageReply.senderID == api.getCurrentUserID();

    if (matchedKeyword || isReplyToBot) {
      let query = "";

      if (matchedKeyword) {
        query = body.slice(matchedKeyword.length).trim();
      } else {
        query = body.trim();
      }

      // ২. শুধু নাম ধরে ডাকলে (সাথে কোনো প্রশ্ন না থাকলে) উত্তর
      if (matchedKeyword && !query) {
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

      // ৩. পরিচয় সংক্রান্ত কাস্টম উত্তর
      const identityQuery = query.toLowerCase();
      if (identityQuery.includes("তোমার নাম কি") || identityQuery.includes("নাম কি") || identityQuery.includes("whats your name")) {
        return api.sendMessage("আমার নাম চিট্টি (Citti)।", threadID, messageID);
      }
      
      if (identityQuery.includes("কে বানাইছে") || identityQuery.includes("owner") || identityQuery.includes("তৈরি করেছে") || identityQuery.includes("creator")) {
        return api.sendMessage("আমাকে Lubna Jannat AkHi তৈরি করেছেন।", threadID, messageID);
      }

      // ৪. Meta AI API এর মাধ্যমে উত্তর জেনারেট করা
      try {
        const sessionID = `chat-${senderID}`;
        const fullResponse = await axios.post(API_ENDPOINT, { 
            message: query, 
            new_conversation: matchedKeyword ? true : false, 
            cookies: {} 
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 15000 
        });
        
        const aiMessage = fullResponse.data.message;

        if (typeof aiMessage === 'string' && aiMessage.trim().length > 0) {
            await message.reply(aiMessage, (err, info) => {
                if (info) {
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName: this.config.name,
                        author: senderID,
                        messageID: info.messageID,
                        sessionID: sessionID 
                    });
                }
            });
        } else {
            await message.reply("AI থেকে কোনো উত্তর পাওয়া যায়নি। আবার চেষ্টা করুন।");
        }

      } catch (error) {
        console.error("AI Error:", error.message);
        await message.reply("❌ AI এখন উত্তর দিতে পারছে না। পরে চেষ্টা করুন।");
      }
    }
  },

  // ৫. রিপ্লাই এর মাধ্যমে চ্যাট চালিয়ে যাওয়ার জন্য onReply অংশ
  onReply: async function ({ message, event, Reply }) {
    const userID = event.senderID;
    const query = event.body?.trim();
    
    if (userID !== Reply.author || !query) return;

    global.GoatBot.onReply.delete(Reply.messageID);
    const sessionID = Reply.sessionID || `chat-${userID}`;

    try {
      const fullResponse = await axios.post(API_ENDPOINT, { 
          message: query, 
          new_conversation: false, 
          cookies: {} 
      }, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000 
      });
      
      const aiMessage = fullResponse.data.message;

      if (typeof aiMessage === 'string' && aiMessage.trim().length > 0) {
          await message.reply(aiMessage, (err, info) => {
              if (info) {
                  global.GoatBot.onReply.set(info.messageID, {
                      commandName: this.config.name,
                      author: userID,
                      messageID: info.messageID,
                      sessionID: sessionID 
                  });
              }
          });
      }
    } catch (error) {
      console.error("Reply Error:", error.message);
    }
  }
};

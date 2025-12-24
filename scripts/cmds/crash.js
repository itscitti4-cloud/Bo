const fs = require("fs-extra");

module.exports = {
  config: {
    name: "crash",
    version: "2.0",
    author: "AkHi",
    countDown: 5,
    role: 0,
    shortDescription: "Bet and cash out before it crashes!",
    category: "game",
    guide: "{pn} [amount]"
  },

  onStart: async function ({ api, event, args, usersData }) {
    const { senderID, threadID, messageID } = event;

    // ১. ব্যালেন্স চেক এবং ইনপুট ভ্যালিডেশন
    const userData = await usersData.get(senderID);
    if (!userData) return api.sendMessage("❌ | ইউজার ডাটা পাওয়া যায়নি।", threadID, messageID);

    let balance = userData.money || 0;
    let betAmount = args[0] === "all" ? balance : parseInt(args[0]);

    if (isNaN(betAmount) || betAmount < 50) {
      return api.sendMessage("❌ | Please enter a valid bet amount (Minimum: 50$).", threadID, messageID);
    }
    if (betAmount > balance) {
      return api.sendMessage(`🚫 | You don't have enough money! Your balance: ${balance}$`, threadID, messageID);
    }

    // বাজি ধরার টাকা কেটে নেওয়া
    await usersData.set(senderID, { money: balance - betAmount });

    // ২. গেম লজিক সেটিংস
    let multiplier = 1.0;
    const crashAt = (Math.random() * 5 + 1.1).toFixed(2); // ১.১০ থেকে ৬.১০ এর মধ্যে ক্রাশ হবে
    let isCashedOut = false;

    const gameMsg = await api.sendMessage(
      `🚀 | **CRASH GAME STARTED**\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `💰 Bet Amount: ${betAmount}$\n` +
      `📈 Multiplier: 1.00x\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `💬 Reply "stop" to cash out!`,
      threadID
    );

    // ৩. রিপ্লাই লিসেনার সেট করা
    global.GoatBot.onReply.set(gameMsg.messageID, {
      commandName: this.config.name,
      messageID: gameMsg.messageID,
      author: senderID,
      betAmount,
      multiplier,
      crashAt,
      isCashedOut: false
    });

    // ৪. এনিমেশন লুপ (প্রতি ২ সেকেন্ডে আপডেট হবে)
    const interval = setInterval(async () => {
      const currentData = global.GoatBot.onReply.get(gameMsg.messageID);
      if (!currentData || currentData.isCashedOut) {
        clearInterval(interval);
        return;
      }

      multiplier = (parseFloat(multiplier) + 0.3).toFixed(2);
      currentData.multiplier = multiplier; // গ্লোবাল ডাটা আপডেট

      // যদি ক্রাশ পয়েন্টে পৌঁছায়
      if (multiplier >= crashAt) {
        clearInterval(interval);
        global.GoatBot.onReply.delete(gameMsg.messageID);
        return api.editMessage(
          `💥 | **BOOM! IT CRASHED**\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `📉 Crashed at: ${multiplier}x\n` +
          `💸 You lost: ${betAmount}$\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          ` Better luck next time! 🍀`,
          gameMsg.messageID
        );
      }

      // গ্রাফ আপডেট করা
      api.editMessage(
        `🚀 | **CRASHING SOON...**\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `💰 Bet Amount: ${betAmount}$\n` +
        `📈 Current: ${multiplier}x\n` +
        `💵 Potential Win: ${Math.floor(betAmount * multiplier)}$\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `💬 Reply "stop" to cash out!`,
        gameMsg.messageID
      );
    }, 2500);
  },

  // ৫. ক্যাশ আউট হ্যান্ডলার (onReply আলাদাভাবে থাকবে)
  onReply: async function ({ api, event, Reply, usersData }) {
    const { senderID, body, threadID, messageID } = event;
    if (senderID !== Reply.author) return;

    if (body.toLowerCase() === "stop") {
      const currentData = global.GoatBot.onReply.get(Reply.messageID);
      if (!currentData || currentData.isCashedOut) return;

      currentData.isCashedOut = true; // গেম থামানো
      const finalMultiplier = currentData.multiplier;
      const winAmount = Math.floor(Reply.betAmount * finalMultiplier);

      const userData = await usersData.get(senderID);
      await usersData.set(senderID, { money: (userData.money || 0) + winAmount });

      global.GoatBot.onReply.delete(Reply.messageID);

      return api.sendMessage(
        `💰 | **CASHED OUT SUCCESSFULLY!**\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `🌟 Multiplier: ${finalMultiplier}x\n` +
        `💵 You Won: ${winAmount}$\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `Congratulations! Your balance has been updated. ✨`,
        threadID,
        messageID
      );
    }
  }
};

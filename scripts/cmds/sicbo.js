const axios = require("axios");

module.exports = {
  config: {
    name: "sicbo",
    aliases: ["dice", "sb"],
    version: "1.0",
    author: "AkHi",
    countDown: 5,
    role: 0,
    shortDescription: "Play Sicbo (Big/Small) with betting",
    longDescription: "Bet on Small (4-10) or Big (11-17) using your balance.",
    category: "game",
    guide: "{pn} <big | small> <amount>"
  },

  onStart: async function ({ message, args, usersData }) {
    const { senderID, reply } = message;
    
    // ১. ইনপুট চেক
    if (args.length < 2) {
      return reply("⚠️ [ 𝗜𝗡𝗩𝗔𝗟𝗜𝗗 𝗨𝗦𝗔𝗚𝗘 ]\nCorrect format: !sicbo <big/small> <bet_amount>");
    }

    const betChoice = args[0].toLowerCase();
    const betAmount = parseInt(args[1]);
    const userData = await usersData.get(senderID);
    const userMoney = userData.money;

    if (!["big", "small"].includes(betChoice)) {
      return reply("❌ [ 𝗘𝗥𝗥𝗢𝗥 ]\nYou can only bet on 'big' or 'small'.");
    }

    if (isNaN(betAmount) || betAmount <= 0) {
      return reply("❌ [ 𝗘𝗥𝗥𝗢𝗥 ]\nPlease enter a valid bet amount.");
    }

    if (betAmount > userMoney) {
      return reply(`❌ [ 𝗜𝗡𝗦𝗨𝗙𝗙𝗜𝗖𝗜𝗘𝗡𝗧 𝗙𝗨𝗡𝗗𝗦 ]\nYou only have $${userMoney} in your wallet.`);
    }

    // ২. ডাইস রোলিং (৩টি ডাইস)
    const dice = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1
    ];
    const total = dice.reduce((a, b) => a + b, 0);
    const diceEmojis = dice.map(d => ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][d]).join(" ");
    
    let result = "";
    if (total >= 4 && total <= 10) result = "small";
    else if (total >= 11 && total <= 17) result = "big";
    else result = "triple"; // ৩টি ডাইস একই হলে হাউজ জিতে যায়

    // ৩. ফলাফল নির্ধারণ
    const isWin = betChoice === result;
    
    if (isWin) {
      const winMoney = betAmount;
      await usersData.set(senderID, { money: userMoney + winMoney });
      
      return reply(
        `╭───✦ [ 𝗦𝗜𝗖𝗕𝗢 𝗥𝗘𝗦𝗨𝗟𝗧 ]\n` +
        `├‣ 🎲 Dice: ${diceEmojis}\n` +
        `├‣ 📊 Total: ${total}\n` +
        `├‣ 🏆 Outcome: ${result.toUpperCase()}\n` +
        `╰──────────────◊\n\n` +
        `🎊 [ 𝗖𝗢𝗡𝗚𝗥𝗔𝗧𝗨𝗟𝗔𝗧𝗜𝗢𝗡𝗦 ]\n` +
        `You won $${winMoney}!\n` +
        `💰 Current Balance: $${userMoney + winMoney}`
      );
    } else {
      await usersData.set(senderID, { money: userMoney - betAmount });
      
      return reply(
        `╭───✦ [ 𝗦𝗜𝗖𝗕𝗢 𝗥𝗘𝗦𝗨𝗟𝗧 ]\n` +
        `├‣ 🎲 Dice: ${diceEmojis}\n` +
        `├‣ 📊 Total: ${total}\n` +
        `├‣ 📉 Outcome: ${result.toUpperCase()}\n` +
        `╰──────────────◊\n\n` +
        `💀 [ 𝗬𝗢𝗨 𝗟𝗢𝗦𝗧 ]\n` +
        `Better luck next time! You lost $${betAmount}.\n` +
        `💰 Current Balance: $${userMoney - betAmount}`
      );
    }
  }
};

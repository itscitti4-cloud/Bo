const moment = require('moment-timezone');
require('moment-hijri'); 

module.exports = {
  config: {
    name: "datetime",
    aliases: ["date", "time", "clock"],
    version: "2.7",
    author: "AkHi",
    countdown: 5,
    role: 0,
    shortDescription: "Shows premium time and date in English numbers.",
    category: "utility",
    guide: "{prefix}{name}"
  },

  onStart: async function ({ message }) {
    try {
      const timezone = "Asia/Dhaka";
      // ভাষা ইংরেজি (en) সেট করা হলো যাতে আরবি সংখ্যা না আসে
      const now = moment().tz(timezone).locale('en');
      
      // হিজরি তারিখ সংশোধন: iYYYY, iMMMM, iD ব্যবহার করুন কিন্তু 'i' সরাসরি টেক্সটে না
      const hijriDate = now.format("iD MMMM iYYYY");

      // বাংলা তারিখ ইংরেজি সংখ্যায় পেতে লোকাল 'en-GB' ব্যবহার করা হলো
      const bngDate = new Intl.DateTimeFormat('bn-BD-u-nu-latn', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(now.toDate());

      const premiumReply = 
        `»—☀️— **𝐓𝐈𝐌𝐄 𝐃𝐄𝐓𝐀𝐈𝐋𝐒** —☀️—«\n\n` +
        ` ➤ 𝐃𝐚𝐭𝐞: ${now.format("DD-MMMM-YYYY")}\n` +
        ` ➤ 𝐁𝐚𝐧𝐠𝐥𝐚: ${bngDate}\n` +
        ` ➤ 𝐇𝐢𝐣𝐫𝐢: ${hijriDate}\n` +
        ` ➤ 𝐓𝐢𝐦𝐞: ${now.format("hh:mm A")}\n` +
        ` ➤ 𝐃𝐚𝐲: ${now.format("dddd")}\n\n` +
        `»——— @Lubna Jannat ———«`;

      return message.reply(premiumReply);

    } catch (error) {
      console.error("Error:", error);
      message.reply("⚠️ An error occurred while retrieving the time details.");
    }
  }
};

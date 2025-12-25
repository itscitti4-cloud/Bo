const moment = require('moment-timezone');
require('moment-hijri'); 

module.exports = {
  config: {
    name: "datetime",
    aliases: ["date", "time", "clock"],
    version: "2.8",
    author: "AkHi",
    countdown: 5,
    role: 0,
    shortDescription: "Shows premium time and date (English, Bangla & Hijri).",
    category: "utility",
    guide: "{prefix}{name}"
  },

  onStart: async function ({ message }) {
    try {
      const timezone = "Asia/Dhaka";
      const now = moment().tz(timezone);
      
      // ১. ইংরেজি তারিখ (Date: 26 December, 2025)
      const engDate = now.format("DD MMMM, YYYY");

      // ২. বাংলা তারিখ (Bangla: ১০ পৌষ, ১৪৩২)
      const bngDate = new Intl.DateTimeFormat('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(now.toDate());

      // ৩. হিজরি তারিখ (বাংলায় মাসের নামসহ)
      const hijriMonthEn = now.format("iMMMM");
      const hijriYear = now.format("iYYYY");
      const hijriDay = now.format("iD");

      // হিজরি মাস বাংলায় রূপান্তর করার ম্যাপ
      const hijriMonthsBn = {
        'Muharram': 'মুহররম', 'Safar': 'সফর', 'Rabi\' al-awwal': 'রবিউল আউয়াল',
        'Rabi\' ath-thani': 'রবিউস সানি', 'Jumada al-ula': 'জুমাদাল উলা',
        'Jumada al-akhira': 'জুমাদাস সানি', 'Rajab': 'রজব', 'Sha\'ban': 'শাবান',
        'Ramadan': 'রমজান', 'Shawwal': 'শাওয়াল', 'Dhu al-Qi\'dah': 'জিলকদ',
        'Dhu al-Hijjah': 'জিলহজ'
      };
      
      const hijriMonthBn = hijriMonthsBn[hijriMonthEn] || hijriMonthEn;
      const hijriDateFinal = `${hijriMonthBn}, ${hijriYear}`;

      const premiumReply = 
        `»—☀️— **𝐓𝐈𝐌𝐄 𝐃𝐄𝐓𝐀𝐈𝐋𝐒** —☀️—«\n\n` +
        ` ➤ 𝐓𝐢𝐦𝐞: ${now.format("hh:mm A")}\n` +
        ` ➤ 𝐃𝐚𝐲: ${now.format("dddd")}\n\n` +
        ` ➤ 𝐃𝐚𝐭𝐞: ${engDate}\n` +
        ` ➤ বাংলা: ${bngDate}\n` +
        ` ➤ হিজরী: ${hijriDateFinal}\n` +
        `»——— @Lubna Jannat ———«`;

      return message.reply(premiumReply);

    } catch (error) {
      console.error("Error:", error);
      message.reply("⚠️ An error occurred while retrieving the time details.");
    }
  }
};

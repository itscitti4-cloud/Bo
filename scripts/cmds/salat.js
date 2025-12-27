const axios = require("axios");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "salat",
    version: "3.6.0",
    author: "AkHi",
    countDown: 2,
    role: 0,
    shortDescription: "Get prayer times and Ramadan timings",
    longDescription: "View 5 daily prayer times or Ramadan (Sehri/Iftar) timings by city with 12h format and fully Bengali Hijri date.",
    category: "utility",
    guide: "{pn} <city> or {pn} ramadan <city>"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const timezone = "Asia/Dhaka";
    const dateNow = moment.tz(timezone).format("DD-MM-YYYY");

    if (args.length === 0) {
      return api.sendMessage("Please provide a city name. Example: !salat Dhaka", threadID, messageID);
    }

    let city = "";
    let isRamadan = false;

    if (args[0].toLowerCase() === "ramadan") {
      isRamadan = true;
      city = args.slice(1).join(" ") || "Dhaka";
    } else {
      city = args.join(" ");
    }

    try {
      const response = await axios.get(`https://api.aladhan.com/v1/timingsByCity/${dateNow}`, {
        params: {
          city: city,
          country: "Bangladesh",
          method: 2
        }
      });

      const data = response.data.data;
      const timings = data.timings;

      // ১২ ঘণ্টার ফরম্যাটে রূপান্তর
      const formatTime = (time) => moment(time, "HH:mm").format("hh:mm A");

      // ইংরেজি সংখ্যা থেকে বাংলা সংখ্যায় রূপান্তর করার ফাংশন
      const toBanglaNum = (num) => {
        const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
        return num.toString().split('').map(digit => banglaDigits[digit] || digit).join('');
      };

      // হিজরী মাসের নাম বাংলা ম্যাপ
      const hijriMonthsBN = {
        "Muharram": "মুহররম", "Safar": "সফর", "Rabi' al-awwal": "রবিউল আউয়াল",
        "Rabi' al-thani": "রবিউস সানি", "Jumada al-ula": "জমাদিউল আউয়াল",
        "Jumada al-akhira": "জমাদিউস সানি", "Rajab": "রজব", "Sha'ban": "শাবান",
        "Ramadan": "রমজান", "Shawwal": "শাওয়াল", "Dhu al-Qi'dah": "জিলকদ",
        "Dhu al-Hijjah": "জিলহজ"
      };

      const hDay = toBanglaNum(data.date.hijri.day);
      const hMonthBN = hijriMonthsBN[data.date.hijri.month.en] || data.date.hijri.month.en;
      const hYear = toBanglaNum(data.date.hijri.year);
      const hijriDateBN = `${hDay} ${hMonthBN} ${hYear}`;

      if (isRamadan) {
        let msg = `[ 🌙 Ramadan Timings - ${city} ]\n`;
        msg += `--------------------------\n`;
        msg += `📅 Date: ${dateNow}\n`;
        msg += `☪️ Hijri: ${hijriDateBN}\n\n`;
        msg += `🍲 Sehri (Imsak): ${formatTime(timings.Imsak)}\n`;
        msg += `🌅 Iftar (Maghrib): ${formatTime(timings.Maghrib)}\n`;
        msg += `--------------------------\n`;
        msg += `*Keep fasting and stay blessed.*`;
        
        return api.sendMessage(msg, threadID, messageID);
      } else {
        let msg = `[ 🕌 Prayer Times - ${city} ]\n`;
        msg += `--------------------------\n`;
        msg += `📅 Date: ${dateNow}\n`;
        msg += `☪️ Hijri: ${hijriDateBN}\n\n`;
        msg += ` Fajr: ${formatTime(timings.Fajr)}\n`;
        msg += ` Dhuhr: ${formatTime(timings.Dhuhr)}\n`;
        msg += ` Asr: ${formatTime(timings.Asr)}\n`;
        msg += ` Maghrib: ${formatTime(timings.Maghrib)}\n`;
        msg += ` Isha: ${formatTime(timings.Isha)}\n`;
        msg += `--------------------------\n`;
        msg += `*Perform your prayers on time.*`;

        return api.sendMessage(msg, threadID, messageID);
      }
    } catch (error) {
      return api.sendMessage(`Could not find timing for "${city}".`, threadID, messageID);
    }
  }
};
    

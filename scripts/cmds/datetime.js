const moment = require('moment-timezone');
require('moment-hijri');

module.exports = {
  config: {
    name: "datetime",
    aliases: ["date", "time", "clock"],
    version: "3.6",
    author: "AkHi",
    countdown: 5,
    role: 0,
    shortDescription: "Shows time and date with corrected Hijri and Bengali calendar.",
    category: "utility",
    guide: "{prefix}{name}"
  },

  onStart: async function ({ message }) {
    try {
      const timezone = "Asia/Dhaka";
      // locale 'en' নিশ্চিত করবে যাতে সংখ্যার আউটপুট ইংরেজি থাকে
      const now = moment().tz(timezone).locale('en');

      // ১. ইংরেজি সময় ও তারিখ
      const timeStr = now.format("hh:mm A");
      const dayStr = now.format("dddd");
      const engDate = now.format("DD MMMM, YYYY");

      // ২. বঙ্গাব্দ ক্যালকুলেশন (বৈশাখ-জ্যৈষ্ঠ)
      const getBengaliDate = (date) => {
        const d = new Date(date);
        const day = d.getDate();
        const month = d.getMonth() + 1;
        const year = d.getFullYear();

        let bYear = year - 593;
        const months = ["বৈশাখ", "জ্যৈষ্ঠ", "আষাঢ়", "শ্রাবণ", "ভাদ্র", "আশ্বিন", "কার্তিক", "অগ্রহায়ণ", "পৌষ", "মাঘ", "ফাল্গুন", "চৈত্র"];
        const monthDays = [31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30, 30]; 

        if (month < 4 || (month === 4 && day < 14)) bYear -= 1;

        let totalDays = Math.floor((d - new Date(year, 3, 14)) / (24 * 60 * 60 * 1000));
        if (totalDays < 0) {
          totalDays = Math.floor((d - new Date(year - 1, 3, 14)) / (24 * 60 * 60 * 1000));
        }

        let mIndex = 0;
        while (totalDays >= monthDays[mIndex]) {
          totalDays -= monthDays[mIndex];
          mIndex++;
        }
        
        const toBn = (n) => String(n).replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[d]);
        return `${toBn(totalDays + 1)} ${months[mIndex]}, ${toBn(bYear)}`;
      };

      const bngDate = getBengaliDate(now.toDate());

      // ৩. হিজরি তারিখ (সরাসরি iDate, iMonth, iYear ব্যবহার করে)
      const hijriMonthsBn = {
        0: 'মুহররম', 1: 'সফর', 2: 'রবিউল আউয়াল', 3: 'রবিউস সানি',
        4: 'জুমাদাল উলা', 5: 'জুমাদাস সানি', 6: 'রজব', 7: 'শাবান',
        8: 'রমজান', 9: 'শাওয়াল', 10: 'জিলকদ', 11: 'জিলহজ'
      };

      // moment-hijri এর iDate(), iMonth(), iFullYear() মেথড ব্যবহার
      const hDay = now.iDate(); 
      const hMonthNum = now.iMonth(); // ০ থেকে ১১ পর্যন্ত ইনডেক্স দেয়
      const hYear = now.iFullYear();
      const hMonthBn = hijriMonthsBn[hMonthNum];
      
      const hijriDateFinal = `${hDay} ${hMonthBn}, ${hYear}`;

      const premiumReply = 
        `»—☀️— **𝐓𝐈𝐌𝐄 𝐃𝐄𝐓𝐀𝐈𝐋𝐒** —☀️—«\n\n` +
        ` ➤ 𝐓𝐢𝐦𝐞: ${timeStr}\n` +
        ` ➤ 𝐃𝐚𝐲: ${dayStr}\n\n` +
        ` ➤ 𝐃𝐚𝐭𝐞: ${engDate}\n` +
        ` ➤ বাংলা: ${bngDate}\n` +
        ` ➤ হিজরী: ${hijriDateFinal}\n\n` +
        `»——— @Lubna Jannat ———«`;

      return message.reply(premiumReply);

    } catch (error) {
      console.error(error);
      message.reply("⚠️ তারিখ প্রদর্শনে সমস্যা হয়েছে।");
    }
  }
};

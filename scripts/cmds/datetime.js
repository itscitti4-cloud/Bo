const moment = require('moment-timezone');

module.exports = {
  config: {
    name: "datetime",
    aliases: ["date", "time", "clock"],
    version: "4.0",
    author: "AkHi",
    countdown: 5,
    role: 0,
    shortDescription: "Shows time and date with custom Hijri & Bengali calendar.",
    category: "utility",
    guide: "{prefix}{name}"
  },

  onStart: async function ({ message }) {
    try {
      const timezone = "Asia/Dhaka";
      const now = moment().tz(timezone).locale('en');

      // ১. ইংরেজি সময় ও তারিখ
      const timeStr = now.format("hh:mm A");
      const dayStr = now.format("dddd");
      const engDate = now.format("DD MMMM, YYYY");

      // ২. বঙ্গাব্দ (বৈশাখ-জ্যৈষ্ঠ) ক্যালকুলেশন
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
        if (totalDays < 0) totalDays = Math.floor((d - new Date(year - 1, 3, 14)) / (24 * 60 * 60 * 1000));
        let mIndex = 0;
        while (totalDays >= monthDays[mIndex]) {
          totalDays -= monthDays[mIndex];
          mIndex++;
        }
        const toBn = (n) => String(n).replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[d]);
        return `${toBn(totalDays + 1)} ${months[mIndex]}, ${toBn(bYear)}`;
      };

      const bngDate = getBengaliDate(now.toDate());

      // ৩. হিজরি তারিখ ক্যালকুলেশন (প্যাকেজ ছাড়া)
      const getHijriDate = (date) => {
        // Intl.DateTimeFormat ব্যবহার করে হিজরি ডেটা নেওয়া
        const hData = new Intl.DateTimeFormat('en-u-ca-islamic-uma-nu-latn', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }).formatToParts(date);

        const hDay = hData.find(p => p.type === 'day').value;
        const hMonthEn = hData.find(p => p.type === 'month').value;
        const hYear = hData.find(p => p.type === 'year').value;

        const hijriMonthsBn = {
          'Muharram': 'মুহররম', 'Safar': 'সফর', 'Rabiʻ I': 'রবিউল আউয়াল',
          'Rabiʻ II': 'রবিউস সানি', 'Jumada I': 'জুমাদাল উলা',
          'Jumada II': 'জুমাদাস সানি', 'Rajab': 'রজব', 'Shaʻban': 'শাবান',
          'Ramadan': 'রমজান', 'Shawwal': 'শাওয়াল', 'Dhuʻl-Qiʻdah': 'জিলকদ',
          'Dhuʻl-Hijjah': 'জিলহজ'
        };

        return `${hDay} ${hijriMonthsBn[hMonthEn] || hMonthEn}, ${hYear}`;
      };

      const hijriDateFinal = getHijriDate(now.toDate());

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
      message.reply("⚠️ তারিখ প্রসেস করতে সমস্যা হচ্ছে। অনুগ্রহ করে আপনার নোড ভার্সন চেক করুন।");
    }
  }
};

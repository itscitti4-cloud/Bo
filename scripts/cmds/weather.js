const axios = require("axios");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "weather",
    aliases: ["wx", "temp"],
    version: "2.0",
    author: "Gemini AI",
    category: "utility",
    usePrefix: true
  },

  onStart: async function ({ message, args }) {
    const apiKey = "YOUR_OPENWEATHERMAP_API_KEY"; // এখানে আপনার API Key বসান
    const district = args.join(" ");

    if (!district) {
      return message.reply("⚠️ দয়া করে একটি জেলার নাম লিখুন। উদাহরণ: !weather Dhaka");
    }

    try {
      const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${district}&appid=${apiKey}&units=metric&lang=bn`);
      
      const data = res.data;
      const timezone = "Asia/Dhaka";
      const now = moment().tz(timezone);

      // সংখ্যাকে বাংলা অক্ষরে রূপান্তর
      const toBn = (n) => String(n).replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[d]);

      const temp = toBn(Math.round(data.main.temp));
      const feelsLike = toBn(Math.round(data.main.feels_like));
      const humidity = toBn(data.main.humidity);
      const windSpeed = toBn((data.wind.speed * 3.6).toFixed(1)); // km/h
      const description = data.weather[0].description;
      const cityName = data.name;

      // সূর্যোদয় ও সূর্যাস্ত সময়
      const sunrise = moment.unix(data.sys.sunrise).tz(timezone).format("hh:mm A");
      const sunset = moment.unix(data.sys.sunset).tz(timezone).format("hh:mm A");

      const weatherMsg = 
        `☁️ **আবহাওয়ার আপডেট: ${cityName}** ☁️\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `🌡️ তাপমাত্রা: ${temp}°C\n` +
        `🤔 অনুভূত হচ্ছে: ${feelsLike}°C\n` +
        `📝 অবস্থা: ${description.charAt(0).toUpperCase() + description.slice(1)}\n` +
        `💧 আর্দ্রতা: ${humidity}%\n` +
        `💨 বাতাসের গতি: ${windSpeed} কিমি/ঘণ্টা\n\n` +
        `🌅 সূর্যোদয়: ${sunrise}\n` +
        `🌇 সূর্যাস্ত: ${sunset}\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `⏰ আপডেট সময়: ${now.format("hh:mm A")}`;

      return message.reply(weatherMsg);

    } catch (error) {
      if (error.response && error.response.status === 404) {
        return message.reply("❌ জেলার নাম খুঁজে পাওয়া যায়নি। দয়া করে সঠিক ইংরেজি নাম লিখুন (যেমন: Dhaka, Comilla, Sylhet)।");
      }
      console.error(error);
      return message.reply("⚠️ আবহাওয়া তথ্য সংগ্রহ করতে সমস্যা হচ্ছে। পরে আবার চেষ্টা করুন।");
    }
  }
};

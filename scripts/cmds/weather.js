const axios = require("axios");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "weather",
    aliases: ["wx", "temp"],
    version: "2.1",
    author: "AkHi",
    category: "utility",
    usePrefix: true
  },

  onStart: async function ({ message, args }) {
    const apiKey = "63c18557afcebc907940d80f2da1c435"; 
    const district = args.join(" ");

    if (!district) {
      return message.reply("⚠️ Please provide a district name. Example: !weather Dhaka");
    }

    try {
      const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${district}&appid=${apiKey}&units=metric`);
      
      const data = res.data;
      const timezone = "Asia/Dhaka";
      const now = moment().tz(timezone);

      const temp = Math.round(data.main.temp);
      const feelsLike = Math.round(data.main.feels_like);
      const humidity = data.main.humidity;
      const windSpeed = (data.wind.speed * 3.6).toFixed(1); // km/h
      const description = data.weather[0].description;
      const cityName = data.name;

      // Sunrise and Sunset times
      const sunrise = moment.unix(data.sys.sunrise).tz(timezone).format("hh:mm A");
      const sunset = moment.unix(data.sys.sunset).tz(timezone).format("hh:mm A");

      const weatherMsg = 
        `☁️ **Weather Update: ${cityName}** ☁️\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `🌡️ Temperature: ${temp}°C\n` +
        `🤔 Feels Like: ${feelsLike}°C\n` +
        `📝 Condition: ${description.charAt(0).toUpperCase() + description.slice(1)}\n` +
        `💧 Humidity: ${humidity}%\n` +
        `💨 Wind Speed: ${windSpeed} km/h\n\n` +
        `🌅 Sunrise: ${sunrise}\n` +
        `🌇 Sunset: ${sunset}\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `⏰ Updated at: ${now.format("hh:mm A")}`;

      return message.reply(weatherMsg);

    } catch (error) {
      if (error.response && error.response.status === 404) {
        return message.reply("❌ District not found. Please use a valid English name (e.g., Dhaka, Comilla, Sylhet).");
      }
      console.error(error);
      return message.reply("⚠️ Unable to fetch weather data. Please try again later.");
    }
  }
};

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "autodl",
    version: "1.0.0",
    author: "AkHi",
    countDown: 5,
    role: 0,
    description: "Auto download video from Facebook, Insta, TikTok, YouTube, Twitter, Threads",
    category: "media",
    guide: {
      en: "{p}autodl [link]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const link = args[0];
    if (!link) return api.sendMessage("Please provide a video link.", event.threadID, event.messageID);

    api.sendMessage("Processing your video, please wait...", event.threadID, event.messageID);

    try {
      // Using a public multi-downloader API
      const res = await axios.get(`https://api.diegoveteran.repl.co/api/download/all?url=${encodeURIComponent(link)}`);
      const videoUrl = res.data.result.video || res.data.result.url;
      
      const filePath = path.join(__dirname, 'cache', `${Date.now()}.mp4`);
      const videoStream = await axios.get(videoUrl, { responseType: 'arraybuffer' });
      
      fs.writeFileSync(filePath, Buffer.from(videoStream.data, 'utf-8'));

      api.sendMessage({
        body: `✅ Download Successful!\n👤 Author: AkHi`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);

    } catch (err) {
      api.sendMessage("Sorry, the video could not be downloaded. Please check if the link is valid.", event.threadID, event.messageID);
    }
  },

  // Auto-link detection feature
  onChat: async function ({ api, event }) {
    const message = event.body;
    if (!message) return;

    const regex = /(https?:\/\/(?:www\.)?(facebook|fb|instagram|tiktok|youtube|youtu|twitter|x|threads)\.com\/\S+)/ig;
    const match = message.match(regex);

    if (match) {
      this.onStart({ api, event, args: [match[0]] });
    }
  }
};

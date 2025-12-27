const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "autodl",
    version: "1.0.0",
    author: "AkHi",
    countDown: 15,
    role: 0,
    description: "Auto download video from Facebook, Insta, TikTok, YouTube, Twitter, Threads",
    category: "media",
    guide: {
      en: "{p}autodl [link]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const link = args[0] || event.body;
    if (!link || !link.startsWith("http")) return;

    // ⌛ Reaction for processing
    api.setMessageReaction("⌛", event.messageID, () => {}, true);
    
    // Status message
    const waitMsg = await api.sendMessage("Processing your video, please wait...", event.threadID, event.messageID);

    try {
      // Using a more stable and powerful downloader API
      const res = await axios.get(`https://api.vkrhost.in/api/download?url=${encodeURIComponent(link)}`);
      
      // Checking for the best possible video source in the response
      const videoUrl = res.data.data.url || res.data.data.medias[0].url;

      if (!videoUrl) throw new Error("Video URL not found");

      const filePath = path.join(__dirname, 'cache', `${Date.now()}.mp4`);
      const videoStream = await axios.get(videoUrl, { responseType: 'arraybuffer' });
      
      fs.ensureDirSync(path.join(__dirname, 'cache'));
      fs.writeFileSync(filePath, Buffer.from(videoStream.data, 'binary'));

      await api.sendMessage({
        body: `✅ Download Successful!\n👤 Author: AkHi`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID);

      // ✅ Reaction for success
      api.setMessageReaction("✅", event.messageID, () => {}, true);
      
      // Cleanup
      fs.unlinkSync(filePath);
      api.unsendMessage(waitMsg.messageID);

    } catch (err) {
      // ❌ Reaction for failure
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("Sorry, the video could not be downloaded. The link might be private or the server is busy.", event.threadID, event.messageID);
      api.unsendMessage(waitMsg.messageID);
    }
  },

  onChat: async function ({ api, event }) {
    if (!event.body) return;
    
    const regex = /(https?:\/\/(?:www\.)?(facebook|fb|instagram|tiktok|youtube|youtu|twitter|x|threads)\.com\/\S+|https?:\/\/fb\.watch\/\S+)/ig;
    const match = event.body.match(regex);

    if (match) {
      this.onStart({ api, event, args: [match[0]] });
    }
  }
};

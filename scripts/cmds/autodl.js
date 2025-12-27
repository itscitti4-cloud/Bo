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
    const link = args[0] || event.body;
    if (!link || !link.startsWith("http")) return;

    // ⌛ Reaction for processing
    api.setMessageReaction("⌛", event.messageID, () => {}, true);
    const waitMsg = await api.sendMessage("Processing your video, please wait...", event.threadID, event.messageID);

    try {
      // Updated stable API for multiple platforms
      const res = await axios.get(`https://api.samirxpikachu.run/api/videofieri?url=${encodeURIComponent(link)}`);
      
      // API response structure check
      const videoUrl = res.data.videoUrl || res.data.url || res.data.result;

      if (!videoUrl) throw new Error("Could not find video URL");

      const filePath = path.join(__dirname, 'cache', `${Date.now()}.mp4`);
      const videoStream = await axios.get(videoUrl, { responseType: 'arraybuffer' });
      
      fs.ensureDirSync(path.join(__dirname, 'cache'));
      fs.writeFileSync(filePath, Buffer.from(videoStream.data, 'utf-8'));

      await api.sendMessage({
        body: `✅ Download Successful!\n👤 Author: AkHi`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID);

      // ✅ Reaction for success
      api.setMessageReaction("✅", event.messageID, () => {}, true);
      fs.unlinkSync(filePath);
      api.unsendMessage(waitMsg.messageID);

    } catch (err) {
      // ❌ Reaction for failure
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("Sorry, the video could not be downloaded. The link might be private or the server is busy.", event.threadID, event.messageID);
    }
  },

  onChat: async function ({ api, event }) {
    if (event.body && (event.body.includes("facebook.com") || event.body.includes("fb.watch") || event.body.includes("tiktok.com") || event.body.includes("instagram.com") || event.body.includes("youtube.com") || event.body.includes("youtu.be") || event.body.includes("threads.net"))) {
      this.onStart({ api, event, args: [event.body] });
    }
  }
};

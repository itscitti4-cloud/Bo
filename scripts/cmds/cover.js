const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "cover",
        aliases: ["cvr", "cp"],
        version: "1.1",
        author: "AkHi",
        countDown: 5,
        role: 0,
        description: "Fetch user's cover photo",
        category: "utility",
        guide: "{pn}: Fetch your cover photo"
            + "\n   {pn} <@tag>: Fetch tagged user's cover photo"
            + "\n   {pn} <uid>: Fetch cover photo from UID"
            + "\n   (Or reply to someone's message)"
    },

    onStart: async function ({ api, event, args, usersData }) {
        const { threadID, messageID, senderID, messageReply, mentions } = event;
        
        try {
            let uid = senderID;
            
            // UID নির্ধারণ
            if (messageReply) {
                uid = messageReply.senderID;
            } else if (Object.keys(mentions).length > 0) {
                uid = Object.keys(mentions)[0];
            } else if (args[0] && !isNaN(args[0])) {
                uid = args[0];
            }

            if (!uid) return api.sendMessage("❌ Invalid UID.", threadID, messageID);
            
            api.sendMessage("🔍 Fetching cover photo, please wait...", threadID, messageID);

            // ইউজার নাম সংগ্রহ
            const userName = await usersData.getName(uid);
            
            // কভার ফটোর বিকল্প লিঙ্ক (টোকেন ছাড়া অনেক সময় কাজ করে)
            // নোট: সরাসরি গ্রাফ এপিআই অনেক সময় টোকেন ছাড়া ছবি দেয় না
            const coverURL = `https://graph.facebook.com/${uid}/?fields=cover&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
            
            const res = await axios.get(coverURL);
            
            if (!res.data.cover || !res.data.cover.source) {
                return api.sendMessage(`× ${userName} এর কভার ফটো পাওয়া যায়নি অথবা এটি প্রাইভেট।`, threadID, messageID);
            }

            const imgURL = res.data.cover.source;
            const cachePath = path.join(__dirname, "cache", `cover_${uid}.jpg`);
            await fs.ensureDir(path.dirname(cachePath));

            const imgRes = await axios.get(imgURL, { responseType: "arraybuffer" });
            await fs.writeFile(cachePath, Buffer.from(imgRes.data));

            return api.sendMessage({
                body: `✅ Cover photo of ${userName}`,
                attachment: fs.createReadStream(cachePath)
            }, threadID, () => fs.removeSync(cachePath), messageID);

        } catch (err) {
            console.error(err);
            return api.sendMessage("× এই ইউজারের প্রোফাইল রেস্ট্রিক্টেড বা কভার ফটো পাবলিক নয়।", threadID, messageID);
        }
    }
};

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "cover",
        aliases: ["cvr", "cp"],
        version: "1.2",
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
            if (messageReply) {
                uid = messageReply.senderID;
            } else if (Object.keys(mentions).length > 0) {
                uid = Object.keys(mentions)[0];
            } else if (args[0] && !isNaN(args[0])) {
                uid = args[0];
            }

            if (!uid) return api.sendMessage("❌ Invalid UID.", threadID, messageID);
            
            const userName = await usersData.getName(uid);
            api.sendMessage(`🔍 Fetching cover photo of ${userName}...`, threadID, messageID);

            // ১. বিকল্প এপিআই ব্যবহার (এটি অনেক সময় টোকেন ছাড়াই কাজ করে)
            let imgURL;
            try {
                const token = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662"; // আপনার আগের টোকেন
                const res = await axios.get(`https://graph.facebook.com/${uid}?fields=cover&access_token=${token}`);
                imgURL = res.data.cover ? res.data.cover.source : null;
            } catch (e) {
                // টোকেন কাজ না করলে এই ব্লকে আসবে
                imgURL = null;
            }

            // ২. যদি প্রথম উপায় কাজ না করে তবে দ্বিতীয় মেথড
            if (!imgURL) {
                try {
                    // কিছু পাবলিক এপিআই অনেক সময় ইউআইডি দিয়ে ছবি সরাসরি দেয়
                    const altRes = await axios.get(`https://graph.facebook.com/${uid}/picture?type=large&redirect=false`);
                    // নোট: এটি প্রোফাইল পিকচারের জন্য বেশি কাজ করে। 
                    // কভার ফটোর জন্য আসলে একটি ভ্যালিড টোকেন মাস্ট।
                } catch (e) {}
            }

            if (!imgURL) {
                return api.sendMessage(`× ${userName} এর কভার ফটো পাওয়া যায়নি।\nকারণ: টোকেন ইনভ্যালিড অথবা প্রোফাইলটি লক/প্রাইভেট।`, threadID, messageID);
            }

            const cachePath = path.join(__dirname, "cache", `cover_${uid}.jpg`);
            await fs.ensureDir(path.dirname(cachePath));

            const imgRes = await axios.get(imgURL, { responseType: "arraybuffer" });
            await fs.writeFile(cachePath, Buffer.from(imgRes.data));

            return api.sendMessage({
                body: `✅ Cover photo of ${userName}`,
                attachment: fs.createReadStream(cachePath)
            }, threadID, () => fs.removeSync(cachePath), messageID);

        } catch (err) {
            return api.sendMessage("× প্রোফাইল রেস্ট্রিক্টেড হওয়ার কারণে ছবি আনা সম্ভব হচ্ছে না।", threadID, messageID);
        }
    }
};

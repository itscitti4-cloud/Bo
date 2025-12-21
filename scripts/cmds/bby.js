const fs = require('fs-extra');
const path = require('path');

const cacheDir = path.join(__dirname, "cache");
const filePath = path.join(cacheDir, "babyData.json");

if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
}

if (!fs.existsSync(filePath)) {
    const initialData = {
        responses: {},
        teachers: {},
        randomReplies: [
            "babu khuda lagse🥺", "Hop beda😾", "আমাকে ডাকলে, আমি কিন্তু কিস করে দেবো😘", "🐒🐒🐒", "bye",
            "mb ney bye", "meww", "𝗜 𝗹𝗼𝘃𝗲 𝘆𝗼𝘂__😘😘", "𝗜 𝗵𝗮𝘁𝗲 𝘆𝗼𝘂__😏😏", "অ্যাসলামওয়ালিকুম",
            "কেমন আছো?", "বলেন sir__😌", "বলেন ম্যাডাম__😌", "🙂🙂🙂", "𝗕𝗯𝘆 না জানু, বল 😌",
            "তোর বিয়ে হয় নি 𝗕𝗯𝘆 হইলো কিভাবে,,🙄", "বলো জানু 😒", "Meow🐤"
        ]
    };
    fs.writeJsonSync(filePath, initialData);
}

module.exports.config = {
    name: "bby",
    aliases: ["baby", "hinata", "babe", "citti"],
    version: "7.1.0",
    author: "AkHi",
    countDown: 0,
    role: 0,
    description: "Prefix for teach/admin, No-Prefix for chatting",
    category: "chat",
    guide: {
        en: "Prefix Commands:\n{pn} teach [Q] - [A]\n{pn} remove [Q]\n{pn} list\n{pn} edit [Q] - [New A]\n\nNo-Prefix:\nJust call 'baby', 'bby', or 'citti' followed by your message."
    }
};

// --- prefix কমান্ড হ্যান্ডলার (Teach, Remove, List, Edit) ---
module.exports.onStart = async ({ api, event, args, usersData }) => {
    const { threadID, messageID, senderID } = event;
    let data = fs.readJsonSync(filePath);

    try {
        if (!args[0]) return api.sendMessage("Bolo baby, ki bolba? (Use teach, remove, list, edit with prefix)", threadID, messageID);

        // ১. রিমুভ কমান্ড
        if (args[0] === 'remove' || args[0] === 'rm') {
            const key = args.slice(1).join(" ").toLowerCase();
            if (data.responses[key]) {
                delete data.responses[key];
                fs.writeJsonSync(filePath, data);
                return api.sendMessage(`🗑️ | "${key}" রিমুভ করা হয়েছে।`, threadID, messageID);
            }
            return api.sendMessage("❌ | এই নামে কোনো ডেটা নেই।", threadID, messageID);
        }

        // ২. লিস্ট কমান্ড
        if (args[0] === 'list') {
            const totalQ = Object.keys(data.responses).length;
            let msg = `❇️ | Total Questions: ${totalQ}\n`;
            return api.sendMessage(msg, threadID, messageID);
        }

        // ৩. এডিট কমান্ড
        if (args[0] === 'edit') {
            const content = args.slice(1).join(" ").split(/\s*-\s*/);
            const ques = content[0]?.toLowerCase();
            const newAns = content[1];
            if (!ques || !newAns) return api.sendMessage("❌ | Format: edit [Q] - [New A]", threadID, messageID);
            
            if (data.responses[ques]) {
                data.responses[ques] = [newAns];
                fs.writeJsonSync(filePath, data);
                return api.sendMessage(`✅ | "${ques}" আপডেট হয়েছে।`, threadID, messageID);
            }
            return api.sendMessage("❌ | এটি আগে শেখানো হয়নি।", threadID, messageID);
        }

        // ৪. কথা শেখানো (Teach)
        if (args[0] === 'teach') {
            const content = args.slice(1).join(" ").split(/\s*-\s*/);
            const ques = content[0]?.toLowerCase().trim();
            const ans = content[1]?.trim();

            if (!ques || !ans) return api.sendMessage("❌ | Format: {pn} teach [কথা] - [রিপ্লাই]", threadID, messageID);

            if (!data.responses[ques]) data.responses[ques] = [];
            data.responses[ques].push(ans);
            data.teachers[senderID] = (data.teachers[senderID] || 0) + 1;

            fs.writeJsonSync(filePath, data);
            return api.sendMessage(`✅ | AkHi Ma'am শিখে গেছি!\n🗣️ আপনি বললে: ${ques}\n🤖 আমি বলবো: ${ans}`, threadID, messageID);
        }

    } catch (e) {
        api.sendMessage("Error: " + e.message, threadID, messageID);
    }
};

// --- No-Prefix চ্যাটিং হ্যান্ডলার (নাম ধরে ডাকলে) ---
module.exports.onChat = async ({ api, event }) => {
    if (event.senderID == api.getCurrentUserID()) return;
    const body = event.body ? event.body.toLowerCase() : "";
    const names = ["baby", "bby", "citti", "babu", "hinata"]; // এই নামগুলো ধরে ডাকলে কাজ করবে
    
    // চেক করা হচ্ছে মেসেজটি কোনো নাম দিয়ে শুরু হয়েছে কিনা
    const targetName = names.find(name => body.startsWith(name));

    if (targetName) {
        let data = fs.readJsonSync(filePath);
        // নাম বাদ দিয়ে আসল প্রশ্নটি বের করা
        const input = body.replace(targetName, "").trim();
        
        let response;
        if (!input) {
            response = ["Bolo baby", "Janu dako keno?", "Hmm bolo kisu bolba?", "I am here!"];
        } else {
            response = data.responses[input] || data.randomReplies;
        }

        const result = response[Math.floor(Math.random() * response.length)];
        return api.sendMessage(result, event.threadID, event.messageID);
    }
};
                    

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
    version: "8.0.0",
    author: "AkHi",
    countDown: 0,
    role: 0,
    description: "Prefix for admin, No-Prefix & Reply for continuous chatting",
    category: "chat",
    guide: {
        en: "1. [Prefix] {pn} teach [Q] - [A]\n2. [No-Prefix] Just call 'baby' or 'bby'\n3. [Continuous] Reply to bot message to chat."
    }
};

// --- ফাংশন: মেসেজ প্রসেসিং ---
function getReply(input, data) {
    const text = input.toLowerCase().trim();
    const response = data.responses[text] || data.randomReplies;
    return response[Math.floor(Math.random() * response.length)];
}

// --- ১. Prefix কমান্ড হ্যান্ডলার (admin tasks) ---
module.exports.onStart = async ({ api, event, args }) => {
    const { threadID, messageID, senderID } = event;
    let data = fs.readJsonSync(filePath);

    try {
        if (!args[0]) return api.sendMessage("Bolo baby, ki bolba? (Use teach, remove, list, edit with prefix)", threadID, messageID);

        if (args[0] === 'remove' || args[0] === 'rm') {
            const key = args.slice(1).join(" ").toLowerCase();
            if (data.responses[key]) {
                delete data.responses[key];
                fs.writeJsonSync(filePath, data);
                return api.sendMessage(`🗑️ | "${key}" রিমুভ করা হয়েছে।`, threadID, messageID);
            }
            return api.sendMessage("❌ | এই নামে কোনো ডেটা নেই।", threadID, messageID);
        }

        if (args[0] === 'teach') {
            const content = args.slice(1).join(" ").split(/\s*-\s*/);
            const ques = content[0]?.toLowerCase().trim();
            const ans = content[1]?.trim();

            if (!ques || !ans) return api.sendMessage("❌ | Format: {pn} teach [কথা] - [রিপ্লাই]", threadID, messageID);

            if (!data.responses[ques]) data.responses[ques] = [];
            data.responses[ques].push(ans);
            data.teachers[senderID] = (data.teachers[senderID] || 0) + 1;

            fs.writeJsonSync(filePath, data);
            return api.sendMessage(`✅ | AkHi Ma'am শিখে গেছি!\n🗣️ আপনি: ${ques}\n🤖 আমি: ${ans}`, threadID, messageID);
        }
        
        // লিস্ট এবং এডিট লজিক চাইলে এখানে যোগ করতে পারেন আগের মতই
    } catch (e) {
        api.sendMessage("Error: " + e.message, threadID, messageID);
    }
};

// --- ২. Continuous Reply হ্যান্ডলার (ChatGPT-র মত রিপ্লাই দিলে কথা বলবে) ---
module.exports.onReply = async ({ api, event, Reply }) => {
    if (event.senderID == api.getCurrentUserID()) return;
    let data = fs.readJsonSync(filePath);
    
    const result = getReply(event.body, data);

    return api.sendMessage(result, event.threadID, (err, info) => {
        if (!err) global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            messageID: info.messageID,
            author: event.senderID
        });
    }, event.messageID);
};

// --- ৩. No-Prefix এবং Initial Chat হ্যান্ডলার ---
module.exports.onChat = async ({ api, event }) => {
    if (event.senderID == api.getCurrentUserID() || !event.body) return;
    
    const body = event.body.toLowerCase();
    const names = ["baby", "bby", "citti", "babu", "hinata"];
    const targetName = names.find(name => body.startsWith(name));

    // যদি নাম ধরে ডাকে
    if (targetName) {
        let data = fs.readJsonSync(filePath);
        const input = body.replace(targetName, "").trim();
        
        let result;
        if (!input) {
            const ran = ["Bolo baby", "Janu dako keno?", "Hmm bolo kisu bolba?", "I am here!"];
            result = ran[Math.floor(Math.random() * ran.length)];
        } else {
            result = getReply(input, data);
        }

        return api.sendMessage(result, event.threadID, (err, info) => {
            if (!err) global.GoatBot.onReply.set(info.messageID, {
                commandName: this.config.name,
                messageID: info.messageID,
                author: event.senderID
            });
        }, event.messageID);
    }
};
    

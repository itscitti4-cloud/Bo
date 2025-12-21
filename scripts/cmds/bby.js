const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

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
    version: "9.0.0",
    author: "AkHi",
    countDown: 0,
    role: 0,
    description: "AI & Teach hybrid chatting bot",
    category: "chat",
    guide: {
        en: "1. [Prefix] {pn} teach [Q] - [A]\n2. [No-Prefix] Just call 'baby' or 'bby'\n3. [Continuous] Reply to bot message to chat."
    }
};

// --- ফাংশন: রিপ্লাই লজিক (Database + AI) ---
async function getSmartReply(input, data) {
    const text = input.toLowerCase().trim();
    
    // ১. চেক করা যদি ডাটাবেজে উত্তর থাকে
    if (data.responses[text]) {
        const responses = data.responses[text];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // ২. ডাটাবেজে না থাকলে AI (SimSimi/Free Chat API) ব্যবহার করা
    try {
        const res = await axios.get(`https://api.simsimi.vn/v1/simtalk`, {
            params: { text: text, lc: 'bn' } // 'bn' for Bengali
        });
        
        if (res.data && res.data.message) {
            return res.data.message;
        } else {
            throw new Error("AI Error");
        }
    } catch (err) {
        // ৩. যদি AI ফেইল করে তবে র‍্যান্ডম রিপ্লাই
        return data.randomReplies[Math.floor(Math.random() * data.randomReplies.length)];
    }
}

// --- ১. Prefix কমান্ড হ্যান্ডলার ---
module.exports.onStart = async ({ api, event, args }) => {
    const { threadID, messageID, senderID } = event;
    let data = fs.readJsonSync(filePath);

    try {
        if (!args[0]) return api.sendMessage("Bolo baby, ki bolba? 😘", threadID, messageID);

        if (args[0] === 'remove' || args[0] === 'rm') {
            const key = args.slice(1).join(" ").toLowerCase();
            if (data.responses[key]) {
                delete data.responses[key];
                fs.writeJsonSync(filePath, data);
                return api.sendMessage(`🗑️ | "${key}" Delete Successfully`, threadID, messageID);
            }
            return api.sendMessage("❌ | Data empty", threadID, messageID);
        }

        if (args[0] === 'teach') {
            const content = args.slice(1).join(" ").split(/\s*-\s*/);
            const ques = content[0]?.toLowerCase().trim();
            const ans = content[1]?.trim();

            if (!ques || !ans) return api.sendMessage("❌ | Format: {pn} teach [message] - [reply]", threadID, messageID);

            if (!data.responses[ques]) data.responses[ques] = [];
            data.responses[ques].push(ans);
            data.teachers[senderID] = (data.teachers[senderID] || 0) + 1;

            fs.writeJsonSync(filePath, data);
            return api.sendMessage(`✅ | Teach done\n🗣️ Someone: ${ques}\n🤖 Me: ${ans}`, threadID, messageID);
        }
    } catch (e) {
        api.sendMessage("Error: " + e.message, threadID, messageID);
    }
};

// --- ২. Continuous Reply হ্যান্ডলার ---
module.exports.onReply = async ({ api, event, Reply }) => {
    if (event.senderID == api.getCurrentUserID()) return;
    let data = fs.readJsonSync(filePath);
    
    const result = await getSmartReply(event.body, data);

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

    if (targetName) {
        let data = fs.readJsonSync(filePath);
        const input = body.replace(targetName, "").trim();
        
        let result;
        if (!input) {
            const ran = ["Bolo baby", "Janu dako keno?", "Hmm bolo kisu bolba?", "I am here!"];
            result = ran[Math.floor(Math.random() * ran.length)];
        } else {
            result = await getSmartReply(input, data);
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

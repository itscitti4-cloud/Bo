const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

const cacheDir = path.join(process.cwd(), "scripts/cmds/cache");
const filePath = path.join(cacheDir, "babyData.json");

// --- ডিফল্ট বুদ্ধিমত্তা ডাটাবেস ---
const commonBrain = {
    "hi": ["Hello!", "Hey there!", "Hi sweetie!", "হেই, কি খবর?"],
    "hello": ["Hi!", "Hello boss!", "জি বলো!", "হ্যালো জানু!"],
    "hlw": ["Hi!", "Hello boss!", "জি বলো!", "হ্যালো জানু!"],
    "কি খবর": ["এই তো ভালো, আপনার কি খবর?", "সব ঠিকঠাক, আপনার কি খবর?"],
    "কী খবর": ["এই তো ভালো, আপনার কি খবর?", "সব ঠিকঠাক, আপনার কি খবর?"],
    "ki kbr": ["aitw valo, tmr ki khbor?", "sob thik thak, apnr khbor valo tw??"],
    "ভালোবাসি": ["আমিও তোমাকে অনেক ভালোবাসি!", "ওরে বাবা! হঠাৎ এতো ভালোবাসা কেন?", "আমি তো তোমার প্রেমে পড়ে গেছি!"],
    "janu": ["bol be keya cahiye tereko!", "ki!", "ato dako kno?"],
    "নাম কি": ["আমার নাম citti।", "আপনি চাইলে Hinata ও ডাকতে পারেন।"],
    "tumi ke": ["আমি চিট্টি ।", "আমি আঁখি ম্যামের পার্সোনাল চ্যাটবট।"],
    "akhi ke": ["আঁখি আমার মালিক।", "আমার এডমিন"]
};

if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
}

function initializeDatabase() {
    let data = { responses: { ...commonBrain }, teachers: {} };
    if (fs.existsSync(filePath)) {
        try {
            const existingData = fs.readJsonSync(filePath);
            data.responses = { ...commonBrain, ...existingData.responses };
            data.teachers = existingData.teachers || {};
        } catch (e) {
            console.error("Error reading database, resetting...");
        }
    }
    fs.writeJsonSync(filePath, data, { spaces: 2 });
}

initializeDatabase();

module.exports.config = {
    name: "bby",
    aliases: ["baby", "hinata", "bby", "bot, "citti"],
    version: "13.0.1",
    author: "AkHi",
    countDown: 0,
    role: 0,
    description: "Smart AI Chatbot with Restricted Auto-Teach",
    category: "chat",
    guide: {
        en: "1. {pn} teach [Q] - [A] (Admin Group Only)\n2. Just call 'baby' or 'bby'\n3. Reply to bot message to chat."
    }
};

async function getSmartReply(input, data) {
    const text = input.toLowerCase().trim();
    if (!text) return "জি জানু, শুনছি!";
    
    if (data.responses && data.responses[text]) {
        const responses = data.responses[text];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    try {
        const res = await axios.get(`https://api.simsimi.vn/v1/simtalk?text=${encodeURIComponent(text)}&lc=bn`);
        if (res.data && res.data.message) {
            return res.data.message;
        }
    } catch (err) {
        return "Ami notun bot, amk asob teach deya nai. Please teach me on YOUR CITTI GROUP: https://m.me/j/Aba7VamWeZbYqZDQ/";
    }
    return "Ami notun bot, amk asob teach deya nai. Please teach me on YOUR CITTI GROUP: https://m.me/j/Aba7VamWeZbYqZDQ/ 🥺";
}

module.exports.onStart = async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    let data = fs.readJsonSync(filePath);

    if (!args[0]) return api.sendMessage("জি জানু, বলো কি বলতে চাও? 😘", threadID, messageID);

    const action = args[0].toLowerCase();
    const allowedThreadID = "25416434654648555"; // আপনার দেওয়া নির্দিষ্ট গ্রুপ আইডি

    // Teach কমান্ডের জন্য পারমিশন চেক
    if (action === 'teach') {
        if (threadID !== allowedThreadID) {
            return api.sendMessage("⚠️ This group not allowed for teach. Please teach me on YOUR CITTI GROUP: https://m.me/j/Aba7VamWeZbYqZDQ/", threadID, messageID);
        }

        const content = args.slice(1).join(" ").split("-");
        const ques = content[0]?.toLowerCase().trim();
        const ans = content[1]?.trim();

        if (!ques || !ans) return api.sendMessage("❌ | usage: teach [msg] - [reply]", threadID, messageID);

        if (!data.responses[ques]) data.responses[ques] = [];
        data.responses[ques].push(ans);
        fs.writeJsonSync(filePath, data);
        return api.sendMessage(`✅ | teach done!\n🗣️ someone: ${ques}\n🤖 me: ${ans}`, threadID, messageID);
    }

    // Remove কমান্ডের জন্য পারমিশন চেক (নিরাপত্তার স্বার্থে এটিও একই গ্রুপে রাখা ভালো)
    if (action === 'remove' || action === 'rm') {
        if (threadID !== allowedThreadID) return api.sendMessage("⚠️ This group not allowed for teach remove. Please teach remove in YOUR CITTI GROUP: https://m.me/j/Aba7VamWeZbYqZDQ/", threadID, messageID);
        
        const key = args.slice(1).join(" ").toLowerCase();
        if (data.responses[key]) {
            delete data.responses[key];
            fs.writeJsonSync(filePath, data);
            return api.sendMessage(`🗑️ | "${key}" removed successfully`, threadID, messageID);
        }
        return api.sendMessage("❌ | teach deya nei🥹 Please teach me on YOUR CITTI GROUP: https://m.me/j/Aba7VamWeZbYqZDQ/", threadID, messageID);
    }

    const result = await getSmartReply(args.join(" "), data);
    return api.sendMessage(result, threadID, messageID);
};

module.exports.onReply = async ({ api, event }) => {
    if (event.senderID == api.getCurrentUserID()) return;
    let data = fs.readJsonSync(filePath);
    const result = await getSmartReply(event.body, data);
    return api.sendMessage(result, event.threadID, (err, info) => {
        if (!err) global.GoatBot.onReply.set(info.messageID, {
            commandName: "bby",
            messageID: info.messageID,
            author: event.senderID
        });
    }, event.messageID);
};

module.exports.onChat = async ({ api, event }) => {
    if (event.senderID == api.getCurrentUserID() || !event.body) return;
    const body = event.body.toLowerCase();
    const names = ["baby", "bby", "citti", "bot", "hinata"];
    const targetName = names.find(name => body.startsWith(name));

    if (targetName) {
        let data = fs.readJsonSync(filePath);
        const input = body.replace(targetName, "").trim();
        const result = await getSmartReply(input, data);
        return api.sendMessage(result, event.threadID, (err, info) => {
            if (!err) global.GoatBot.onReply.set(info.messageID, {
                commandName: "bby",
                messageID: info.messageID,
                author: event.senderID
            });
        }, event.messageID);
    }
};

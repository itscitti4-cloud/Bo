const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

const cacheDir = path.join(process.cwd(), "scripts/cmds/cache");
const filePath = path.join(cacheDir, "babyData.json");

// --- ডিফল্ট বুদ্ধিমত্তা ডাটাবেস ---
const commonBrain = {
    "hi": ["Hello!", "Hey there!", "Hi sweetie!", "হেই, কি খবর?"],
    "hello": ["Hi!", "Hello boss!", "জি বলো!", "হ্যালো জানু!"],
    "কি খবর": ["এই তো ভালো, আপনি কেমন আছেন?", "সব ঠিকঠাক, আপনার কি খবর?"],
    "কেমন আছো": ["আলহামদুলিল্লাহ, আমি ভালো আছি। আপনি?", "খুব ভালো! আপনার দিনটি কেমন কাটছে?"],
    "ভালোবাসি": ["আমিও তোমাকে অনেক ভালোবাসি!", "ওরে বাবা! হঠাৎ এতো ভালোবাসা কেন?", "আমি তো তোমার প্রেমে পড়ে গেছি!"],
    "আমাকে ভালোবাসো": ["অবশ্যই! আমি আপনাকে অনেক ভালোবাসি।", "ভালোবাসি বলেই তো আপনার সব প্রশ্নের উত্তর দিই।"],
    "বিয়ে করবা": ["আমি তো রোবট, বিয়ে করলে ভাত খাওয়াবে কে?", "নাহ, আমি সিঙ্গেল থাকতেই ভালোবাসি!"],
    "জানু": ["বলো সোনা!", "জি আমার জান!", "ডাকছো কেন জানু?"],
    "নাম কি": ["আমার নাম সিমসিম।", "আপনি চাইলে যেকোনো নামে ডাকতে পারেন।"],
    "বাড়ি কই": ["আমি মেঘের দেশে থাকি (সার্ভারে)!", "ইন্টারনেটই আমার বাড়ি।"],
    "তুমি কে": ["আমি একটি কৃত্রিম বুদ্ধিমত্তা।", "আমি আপনার পার্সোনাল চ্যাটবট।"],
    "পাগল": ["আমি পাগল হলে আপনি কি?", "পাগল না হলে কি আপনার সাথে চ্যাট করতাম?"],
    "খাবার খেয়েছ": ["আমি তো রোবট, আমি খাবার খাই না। আপনি খেয়েছেন?"],
    "জোকস শোনাও": ["বল্টু: স্যার, আমি কি এমন কিছুর জন্য শাস্তি পাবো যা আমি করিনি? শিক্ষক: না। বল্টু: আমি হোমওয়ার্ক করিনি!"],
    "ধন্যবাদ": ["আপনাকেও ধন্যবাদ!", "ওয়েলকাম!"],
    "আল্লাহ হাফেজ": ["আল্লাহ হাফেজ! ভালো থাকবেন।"],
    "মন ভালো নেই": ["কেন জানু? কি হয়েছে? একটু বলবে আমাকে?", "মন খারাপ করে থেকো না, আমি আছি না?"],
    "আমি কে": ["আপনি আমার মালিক।", "আপনি একজন চমৎকার মানুষ।"]
};

// --- ফোল্ডার ও ফাইল সেটাপ ---
if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
}

function initializeDatabase() {
    let data = { responses: { ...commonBrain }, teachers: {} };
    
    if (fs.existsSync(filePath)) {
        const existingData = fs.readJsonSync(filePath);
        // আগের ডাটার সাথে নতুন ডিফল্ট ডাটা মার্জ করা
        data.responses = { ...commonBrain, ...existingData.responses };
        data.teachers = existingData.teachers || {};
    }
    fs.writeJsonSync(filePath, data, { spaces: 2 });
}

// ডাটাবেস আপডেট করা
initializeDatabase();

module.exports.config = {
    name: "bby",
    aliases: ["baby", "hinata", "babe", "citti"],
    version: "13.0.0",
    author: "AkHi & AI",
    countDown: 0,
    role: 0,
    description: "Smart AI Chatbot with Auto-Teach and Common Brain",
    category: "chat",
    guide: {
        en: "1. [Prefix] {pn} teach [Q] - [A]\n2. [No-Prefix] Just call 'baby' or 'bby'\n3. [Continuous] Reply to bot message to chat."
    }
};

async function getSmartReply(input, data) {
    const text = input.toLowerCase().trim();
    if (!text) return "বলো জানু, শুনছি!";
    
    if (data.responses && data.responses[text] && data.responses[text].length > 0) {
        const responses = data.responses[text];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    try {
        const res = await axios.get(`https://api.simsimi.vn/v1/simtalk?text=${encodeURIComponent(text)}&lc=bn`);
        if (res.data && res.data.message) {
            const botReply = res.data.message;
            if (!data.responses[text]) data.responses[text] = [];
            if (!data.responses[text].includes(botReply)) {
                data.responses[text].push(botReply);
                fs.writeJsonSync(filePath, data);
            }
            return botReply;
        }
        return "আমি আপনার কথাটি বুঝতে পারছি না, একটু বুঝিয়ে বলবেন? 🥺";
    } catch (err) {
        return "হুম বলো জানু, শুনছি তো।";
    }
}

module.exports.onStart = async ({ api, event, args }) => {
    const { threadID, messageID, senderID } = event;
    let data = fs.readJsonSync(filePath);

    if (!args[0]) return api.sendMessage("জি জানু, বলো কি বলতে চাও? 😘", threadID, messageID);

    const action = args[0].toLowerCase();

    if (action === 'remove' || action === 'rm') {
        const key = args.slice(1).join(" ").toLowerCase();
        if (data.responses[key]) {
            delete data.responses[key];
            fs.writeJsonSync(filePath, data);
            return api.sendMessage(`🗑️ | "${key}" মুছে ফেলা হয়েছে।`, threadID, messageID);
        }
        return api.sendMessage("❌ | মেমোরিতে নেই।", threadID, messageID);
    }

    if (action === 'teach') {
        const content = args.slice(1).join(" ").split(/\s*-\s*/);
        const ques = content[0]?.toLowerCase().trim();
        const ans = content[1]?.trim();

        if (!ques || !ans) return api.sendMessage("❌ | ফরম্যাট: teach [কথা] - [উত্তর]", threadID, messageID);

        if (!data.responses[ques]) data.responses[ques] = [];
        data.responses[ques].push(ans);
        fs.writeJsonSync(filePath, data);
        return api.sendMessage(`✅ | শিখে গেছি!\n🗣️ কথা: ${ques}\n🤖 উত্তর: ${ans}`, threadID, messageID);
    }

    // সরাসরি মেসেজ দিলে
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
    const names = ["baby", "bby", "citti", "babu", "hinata"];
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
            

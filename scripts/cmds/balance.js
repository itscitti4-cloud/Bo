module.exports = {
    config: {
        name: "balance",
        aliases: ["bal", "money", "wallet"],
        version: "2.1.0",
        author: "AkHi",
        countDown: 5,
        role: 0,
        description: "Check current balance in a stylish text format",
        category: "game",
        guide: "{pn} or {pn} @tag"
    },

    onStart: async function({ message, event, usersData, args }) {
        try {
            let targetID = event.senderID;
            
            // টার্গেট ইউজার নির্ধারণ (Reply, Mention, or UID)
            if (event.type == "message_reply") {
                targetID = event.messageReply.senderID;
            } else if (Object.keys(event.mentions).length > 0) {
                targetID = Object.keys(event.mentions)[0];
            } else if (args[0] && !isNaN(args[0])) {
                targetID = args[0];
            }

            // ডাটাবেস থেকে ইউজার ডাটা নেওয়া
            const userData = await usersData.get(targetID);
            
            if (!userData) {
                return message.reply("❌ | 𝐔𝐬𝐞𝐫 𝐧𝐨𝐭 𝐟𝐨𝐮𝐧𝐝 𝐢𝐧 𝐝𝐚𝐭𝐚𝐛𝐚𝐬𝐞!");
            }

            const name = userData.name || "User";
            const balance = userData.money || 0;

            // সংখ্যা ফরম্যাট করা
            const formattedAmount = formatAmount(balance);

            // স্টাইলিশ ফন্ট কনভার্ট করা
            const stylishName = toStylishText(name);
            const stylishBalance = toStylishText(`$${formattedAmount}`);

            const responseMsg = `𝐇𝐞𝐲, ${stylishName}! 👋\n\n𝐘𝐨𝐮𝐫 𝐜𝐮𝐫𝐫𝐞𝐧𝐭 𝐛𝐚𝐥𝐚𝐧𝐜𝐞 𝐢𝐬 ${stylishBalance}`;

            return message.reply(responseMsg);

        } catch (error) {
            console.error("Balance Error:", error);
            return message.reply("⚠️ | 𝐀𝐧 𝐞𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝 𝐰𝐡𝐢𝐥𝐞 𝐜𝐡𝐞𝐜𝐤𝐢𝐧𝐠 𝐭𝐡𝐞 𝐛𝐚𝐥𝐚𝐧𝐜𝐞.");
        }
    }
};

/**
 * বড় সংখ্যাকে সংক্ষেপে প্রকাশ করার ফাংশন (K, M, B, T)
 */
function formatAmount(num) {
    if (isNaN(num)) return "0";
    if (num >= 1e12) return (num / 1e12).toFixed(1) + "T";
    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return num.toLocaleString();
}
        

/**
 * সাধারণ টেক্সটকে বোল্ড সেরিপ (Stylish) টেক্সটে রূপান্তর
 */
function toStylishText(text) {
    const map = {
        'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
        'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢', 'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
        '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗', '$': '💲', '.': '.'
    };
    return text.toString().split('').map(char => map[char] || char).join('');
        }
// টাকা বিয়োগ বা যোগ করার পর এভাবে সেভ করতে হয়
await usersData.set(userID, { 
    money: newBalance 
});

module.exports = {
  config: {
    name: "friend",
    aliases: ["acp", "accept"],
    version: "1.0.0",
    role: 2, // শুধুমাত্র অ্যাডমিন ব্যবহার করতে পারবে (নিরাপত্তার জন্য)
    author: "AkHi",
    description: "Manage friend requests (Accept/Remove)",
    category: "Social",
    guide: {
      en: "!acp <userID> OR !acp remove <userID>"
    },
    countDown: 5
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const action = args[0]?.toLowerCase();
    const uid = args[1];

    // ইউজার আইডি চেক
    if (!action || !uid || isNaN(uid)) {
      return api.sendMessage("AkHi Ma'am, Please use the right format.\n\nguide: !acp <ID>\nঅথবা: !friend remove <ID>", threadID, messageID);
    }

    try {
      if (action === "accept") {
        // fca-horizon-remake এ handleFriendRequest ব্যবহার করা হয়
        // true মানে একসেপ্ট করা
        api.handleFriendRequest(uid, true, (err) => {
          if (err) {
            console.error(err);
            return api.sendMessage(`❌ AkHi Ma'am, Request accept failed\nভুল: ${err.errorDescription || "Unknown error"}`, threadID, messageID);
          }
          return api.sendMessage(`AkHi Ma'am ✅ ${uid} Request accept successfully!`, threadID, messageID);
        });

      } else if (action === "remove" || action === "reject") {
        // false মানে রিকোয়েস্ট ডিলিট বা রিজেক্ট করা
        api.handleFriendRequest(uid, false, (err) => {
          if (err) {
            console.error(err);
            return api.sendMessage(`❌ AkHi Ma'am, Failed to remove friend request।`, threadID, messageID);
          }
          return api.sendMessage(`AkHi Ma'am ${uid}- Request Remove Successfully!`, threadID, messageID);
        });

      } else {
        return api.sendMessage("AkHi Ma'am, please type'accept'/'remove' লিখুন।", threadID, messageID);
      }
    } catch (error) {
      console.error(error);
      return api.sendMessage("AkHi Ma'am, কমান্ডটি কাজ করার সময় একটি ইন্টারনাল এরর হয়েছে। 🥺", threadID, messageID);
    }
  }
};

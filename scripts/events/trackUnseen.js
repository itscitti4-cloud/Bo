module.exports = {
  config: {
    name: "trackUnseen",
    version: "1.0",
    author: "AkHi",
  },

  onStart: async function ({ event, usersData }) {
    const { senderID, body, type } = event;

    // যদি এটি কোনো সাধারণ মেসেজ হয় (text বা media)
    if (type === "message" || type === "message_reply") {
      try {
        // ডাটাবেজে লাস্ট সিন এবং লাস্ট মেসেজ সেভ করা হচ্ছে
        await usersData.set(senderID, {
          lastSeen: Date.now(),
          lastMessage: body || "Sent a media/attachment"
        });
      } catch (error) {
        console.error("❌ [trackUnseen Error]: ", error.message);
      }
    }
  }
};

module.exports = {
  config: {
    name: "trackUnseen",
    version: "1.0",
    author: "AkHi",
    description: "user and thread all record",
    category: "events",
  },
  onStart: async function ({ event, usersData }) {
    const { senderID, body, type } = event;
    if (type === "message" || type === "message_reply") {
      try {
        await usersData.set(senderID, {
          lastSeen: Date.now(),
          lastMessage: body || "Sent a media"
        });
      } catch (e) { console.log(e); }
    }
  }
};

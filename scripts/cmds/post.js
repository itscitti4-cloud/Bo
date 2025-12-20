module.exports = {
  config: {
    name: "post",
    version: "1.0.0",
    role: 2,
    author: "AkHi",
    description: "Post on Facebook",
    category: "Social",
    guide: "{pn} [Caption]",
    countDown: 5
  },

  onStart: async function ({ api, event, args }) {
    const content = args.join(" ");

    if (!content) {
      return api.sendMessage("Please enter the post caption. guide: /post Hello World!", event.threadID, event.messageID);
    }

    api.createPost(content, (err, data) => {
      if (err) {
        return api.sendMessage("Something went wrong *Ma'am*", event.threadID, event.messageID);
      }

      return api.sendMessage("AkHi Ma'am, Post done successfully", event.threadID, event.messageID);
    });
  }
};

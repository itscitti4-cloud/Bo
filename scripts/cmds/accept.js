const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "accept",
    aliases: ["acp", "confirm"],
    version: "2.5.0",
    author: "Gemini AI",
    countDown: 10,
    role: 2,
    shortDescription: "Accept or delete friend requests",
    longDescription: "Manage your Facebook friend requests easily.",
    category: "Utility",
    guide: "{pn}"
  },

  onStart: async function ({ event, api, commandName }) {
    try {
      const form = {
        av: api.getCurrentUserID(),
        fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
        fb_api_caller_class: "RelayModern",
        doc_id: "4499164963466303",
        variables: JSON.stringify({ input: { scale: 3 } })
      };

      const res = await api.httpPost("https://www.facebook.com/api/graphql/", form);
      const data = JSON.parse(res);
      const listRequest = data?.data?.viewer?.friending_possibilities?.edges || [];

      if (listRequest.length === 0) {
        return api.sendMessage("✅ No pending friend requests found.", event.threadID, event.messageID);
      }

      let msg = "📩 𝐏𝐞𝐧𝐝𝐢𝐧𝐠 𝐅𝐫𝐢𝐞𝐧𝐝 𝐑𝐞𝐪𝐮𝐞𝐬𝐭𝐬:\n━━━━━━━━━━━━━━━━━━\n";
      listRequest.forEach((user, index) => {
        msg += `\n${index + 1}. 𝐍𝐚𝐦𝐞: ${user.node.name}\n𝐈𝐃: ${user.node.id}\n`;
      });

      api.sendMessage(
        `${msg}\n━━━━━━━━━━━━━━━━━━\nReply with:\n➤ add <number | all>\n➤ del <number | all>`,
        event.threadID,
        (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            listRequest,
            author: event.senderID
          });
        },
        event.messageID
      );
    } catch (err) {
      api.sendMessage("❌ Error fetching requests. API connection failed.", event.threadID);
    }
  },

  onReply: async function ({ event, api, Reply }) {
    const { author, listRequest, messageID } = Reply;
    if (event.senderID !== author) return;

    const args = event.body.toLowerCase().split(" ");
    const action = args[0];
    const target = args[1];

    if (!["add", "del"].includes(action)) return;

    let targets = target === "all" ? listRequest.map((_, i) => i + 1) : args.slice(1).map(Number);
    const success = [], failed = [];

    api.unsendMessage(messageID);
    const processingMsg = await api.sendMessage(`⏳ Processing ${targets.length} request(s)...`, event.threadID);

    for (const index of targets) {
      const user = listRequest[index - 1];
      if (!user) continue;

      // New Variables structure to match FB's latest update
      const variables = {
        input: {
          source: "friends_tab",
          actor_id: api.getCurrentUserID(),
          friend_requester_id: user.node.id,
          client_mutation_id: Math.round(Math.random() * 100).toString()
        },
        scale: 3
      };

      const form = {
        av: api.getCurrentUserID(),
        fb_api_caller_class: "RelayModern",
        variables: JSON.stringify(variables)
      };

      if (action === "add") {
        form.fb_api_req_friendly_name = "FriendingCometFriendRequestConfirmMutation";
        form.doc_id = "3147613905362928";
      } else {
        form.fb_api_req_friendly_name = "FriendingCometFriendRequestDeleteMutation";
        form.doc_id = "4108254489275063";
      }

      try {
        const res = await api.httpPost("https://www.facebook.com/api/graphql/", form);
        // Checking if response contains data instead of errors
        if (res.includes('"friendship_status":"ARE_FRIENDS"') || res.includes('"friendship_status":"CAN_REQUEST"')) {
          success.push(user.node.name);
        } else {
          failed.push(user.node.name);
        }
      } catch (e) {
        failed.push(user.node.name);
      }
      
      // ছোট বিরতি (ফেসবুক স্প্যাম গার্ড এড়াতে)
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    api.unsendMessage(processingMsg.messageID);
    api.sendMessage(
      `✅ 𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐞𝐝!\n━━━━━━━━━━━━━━━━━━\n✨ 𝐀𝐜𝐜𝐞𝐩𝐭𝐞𝐝: ${success.length}\n❌ 𝐅𝐚𝐢𝐥𝐞𝐝: ${failed.length}\n━━━━━━━━━━━━━━━━━━\n${success.length > 0 ? "Users: " + success.join(", ") : ""}`,
      event.threadID,
      event.messageID
    );
    global.GoatBot.onReply.delete(messageID);
  }
};

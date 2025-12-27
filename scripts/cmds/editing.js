const axios = require('axios');

module.exports = {
  config: {
    name: "editing",
    version: "1.0.2",
    author: "AkHi",
    countDown: 5,
    role: 0,
    shortDescription: "Edit images using AI",
    longDescription: "Reply to an image with prompts to edit it.",
    category: "image",
    guide: "{pn} <edit details>"
  },

  onStart: async function ({ api, event, args, reply }) {
    const { messageReply, threadID, messageID } = event;

    // 1. Check if the user replied to a photo
    if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0 || messageReply.attachments[0].type !== "photo") {
      return reply("Please reply to a photo with the details of how you want to edit it.");
    }

    // 2. Check if the user provided instructions
    const prompt = args.join(" ");
    if (!prompt) {
      return reply("Please provide instructions (e.g., !edit make it a rainy day).");
    }

    const imageUrl = messageReply.attachments[0].url;
    reply("Processing your image with AI... Please wait.");

    try {
      // 3. API Call with your specific API Key
      // Replace the URL below with your actual Adobe Photoshop Service Endpoint
      const response = await axios.get(`https://api.adobe.io/photoshop/edit`, {
        params: {
          url: imageUrl,
          prompt: prompt,
        },
        headers: {
          "x-api-key": "07a8af7b3532494f8a12b71ef01aba4c", // Your API Key
          "Authorization": "Bearer YOUR_ACCESS_TOKEN" // Adobe often requires an Access Token
        }
      });

      const editedImageUrl = response.data.result || response.data.url;

      if (!editedImageUrl) {
        throw new Error("No image returned from API");
      }

      // 4. Sending the edited image back
      return api.sendMessage({
        body: `✅ Image Edited Successfully!\n\nPrompt: "${prompt}"`,
        attachment: await global.utils.getStreamFromURL(editedImageUrl)
      }, threadID, messageID);

    } catch (error) {
      console.error(error);
      return reply("Failed to edit the image. Ensure your API key is active and you have accepted the developer terms in Adobe Console.");
    }
  }
};

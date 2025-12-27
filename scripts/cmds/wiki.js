const axios = require('axios');

module.exports = {
  config: {
    name: "wiki",
    version: "1.0.0",
    author: "AkHi",
    countDown: 5,
    role: 0,
    shortDescription: "Search information from Wikipedia.",
    longDescription: "Get a summary of any topic directly from Wikipedia.",
    category: "utility",
    guide: "{pn} <query>"
  },

  onStart: async function ({ api, event, args, message }) {
    const { threadID, messageID } = event;
    const query = args.join(" ");

    // 1. Check if a query is provided
    if (!query) {
      return message.reply("Please provide a topic to search (e.g., !wiki Artificial Intelligence).");
    }

    try {
      // 2. Fetching data from Wikipedia API
      const response = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
      
      const data = response.data;

      // 3. Checking if the page exists
      if (data.type === 'disambiguation') {
        return message.reply(`The term "${query}" is too broad. Please be more specific.`);
      }

      // 4. Formatting the reply in English
      const title = data.title;
      const description = data.description || "No short description available.";
      const extract = data.extract;
      const wikiUrl = data.content_urls.desktop.page;

      const resultMessage = `🌐 **Wikipedia: ${title}**\n\n` +
                            `📝 **Description:** ${description}\n\n` +
                            `📖 **Summary:** ${extract}\n\n` +
                            `🔗 **Read more:** ${wikiUrl}`;

      // 5. Sending the result with an image if available
      if (data.thumbnail && data.thumbnail.source) {
        return api.sendMessage({
          body: resultMessage,
          attachment: await global.utils.getStreamFromURL(data.thumbnail.source)
        }, threadID, messageID);
      } else {
        return message.reply(resultMessage);
      }

    } catch (error) {
      console.error(error);
      return message.reply(`I couldn't find any Wikipedia article for "${query}". Please check your spelling.`);
    }
  }
};

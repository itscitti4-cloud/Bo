const axios = require('axios');
const moment = require('moment-timezone');

module.exports = {
    config: {
        name: "info",
        aliases: ["inf", "in4"],
        version: "2.6",
        author: "AkHi",
        countDown: 5,
        role: 0,
        shortDescription: { en: "Sends bot and admin info." },
        longDescription: { en: "Sends bot and admin info along." },
        category: "Information",
        guide: { en: "{pn}" }
    },

    onStart: async function ({ message }) {
        this.sendInfo(message);
    },

    onChat: async function ({ event, message }) {
        if (event.body && event.body.trim().toLowerCase() === "info") {
            this.sendInfo(message);
        }
    },

    sendInfo: async function (message) {
        message.reply("Please wait😘").then(async (waitMsg) => {
            setTimeout(() => {
                message.unsend(waitMsg.messageID);
            }, 4000);

            const botName = "Your Citti";
            const botPrefix = `${global.GoatBot.config.prefix}`;
            const authorName = "Lubna Jannat AkHi";
            const authorFB = "https://www.facebook.com/LubnaaJannat.AkHi";
            const authorInsta = "@lubnajannat_";
            const status = "Married to Shahryar Sabu";

            const now = moment().tz('Asia/Dhaka');
            const date = now.format('dddd, MMMM Do YYYY');
            const time = now.format('h:mm:ss A');

            const uptime = process.uptime();
            const seconds = Math.floor(uptime % 60);
            const minutes = Math.floor((uptime / 60) % 60);
            const hours = Math.floor((uptime / (60 * 60)) % 24);
            const days = Math.floor(uptime / (60 * 60 * 24));
            const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`.replace(/^0d 0h /, "");
            
            message.reply({
                    body:
`╭─╼━━━[ 🌟 𝑩𝑶𝑻 & 𝑨𝑼𝑻𝑯𝑶𝑹 𝑰𝑵𝑭𝑶 🌟 ]━━━╾─╮
┃
┃ 👤 𝑶𝒘𝒏𝒆𝒓: ${authorName}
┃ 🤖 𝑩𝒐𝒕 𝑵𝒂𝒎𝒆: ${botName}
┃ 🔰 𝑷𝒓𝒆𝒇𝒊𝒙: ${botPrefix}
┃ ❤ 𝑹𝒆𝒍𝒂𝒕𝒊𝒐𝒏: ${status}
┃
┃ 📆 𝑫𝒂𝒕𝒆: ${date}
┃ ⏰ 𝑻𝒊𝒎𝒆: ${time}
┃ ⚙ 𝑼𝒑𝒕𝒊𝒎𝒆: ${uptimeString}
┃
┃ 🌐 𝑭𝒂𝒄𝒆𝒃𝒐𝒐𝒌: ${authorFB}
┃ 📸 𝑰𝒏𝒔𝒕𝒂: ${authorInsta}
┃
╰─╼━━━━━━━━━━━━━━━━━━━━━━━━━━━━╾─╯`,
                    

            } catch (error) {
                console.error(error);
                message.reply("Please wait");
            }
        });
    }
};

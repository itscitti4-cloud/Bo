module.exports = {
	config: {
		name: "goiadmin",
		author: "AkHi",
		role: 0,
		shortDescription: " ",
		longDescription: "",
		category: "BOT",
		guide: "{pn}"
	},

onChat: function({ api, event }) {
	if (event.senderID !== "61576954220811") {
		var aid = ["61583939430347"];
		for (const id of aid) {
		if ( Object.keys(event.mentions) == id) {
			var msg = ["আখি ম্যাম'কে মেনশন দিছো কেন? কি সমস্যা তোমার?🤔🫡"];
			return api.sendMessage({body: msg[Math.floor(Math.random()*msg.length)]}, event.threadID, event.messageID);
		}
		}}
},
onStart: async function({}) {
	}
};

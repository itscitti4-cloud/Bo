const fs = require("fs-extra");
const request = require("request");

module.exports = {
config: {
    name: "groupinfo",
    aliases: ['boxinfo'],
    version: "1.0",
    author: "AkHi",
    countDown: 5,
    role: 2,
    shortDescription: "See Box info",
    longDescription: "",
    category: "box chat",
    guide: {
      en: "{p} [groupinfo|boxinfo]",
    }
  },

 onStart: async function ({ api, event, args }) {
  let threadInfo = await api.getThreadInfo(event.threadID);
  var memLength = threadInfo.participantIDs.length;
  let threadMem = threadInfo.participantIDs.length;
  var nameMen = [];
    var gendernam = [];
    var gendernu = [];
    var nope = [];
     for (let z in threadInfo.userInfo) {
      var gioitinhone = threadInfo.userInfo[z].gender;
      var nName = threadInfo.userInfo[z].name;
        if(gioitinhone == "MALE"){gendernam.push(z+gioitinhone)}
        else if(gioitinhone == "FEMALE"){gendernu.push(gioitinhone)}
            else{nope.push(nName)}
    };
  var nam = gendernam.length;
    var nu = gendernu.length;
   var listad = '';
   var qtv2 = threadInfo.adminIDs;
  let qtv = threadInfo.adminIDs.length;
  let sl = threadInfo.messageCount;
  let u = threadInfo.nicknames;
  let icon = threadInfo.emoji;
  let threadName = threadInfo.threadName;
  let id = threadInfo.threadID;
   for (let i = 0; i < qtv2.length; i++) {
const infu = (await api.getUserInfo(qtv2[i].id));
const name = infu[qtv2[i].id].name;
    listad += '•' + name + '\n';
  }
  let sex = threadInfo.approvalMode;
      var pd = sex == false ? 'Turned off' : sex == true ? 'Turned on' : 'Kh';
      var callback = () =>
        api.sendMessage(
          {
            body: `🔧「 Box Name」:${threadName}\n🔧「 Box id」: ${id}\n🔧「 Approval」: ${pd}\n🔧「 Emoji」: ${icon}\n🔧「 Information」: 𝐈𝐧𝐜𝐥𝐮𝐝𝐢𝐧𝐠 ${threadMem} 𝐌𝐞𝐦𝐛𝐞𝐫𝐬\n🔧「 Number of males」: ${nam}\n🔧「 Number of females」:  ${nu}\n🔧「 Total administor」: ${qtv} \n「 Include」:\n${listad}\n🔧「 Total number of message」: ${sl} msgs.\n\nBot Developer: Lubna Jannat`,
            attachment: fs.createReadStream(__dirname + '/cache/1.png')
          },
          event.threadID,
          () => fs.unlinkSync(__dirname + '/cache/1.png'),
          event.messageID
        );
      return request(encodeURI(`${threadInfo.imageSrc}`))
        .pipe(fs.createWriteStream(__dirname + '/cache/1.png'))
        .on('close', () => callback());
 }
};

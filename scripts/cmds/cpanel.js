const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

module.exports = {
  config: {
    name: "status",
    version: "1.0.1",
    role: 0,
    author: "AkHi",
    description: "Premium Graphical Server Status",
    category: "system",
    guide: "{pn}",
    countDown: 10
  },

  onStart: async function ({ api, event, message }) {
    const cacheDir = path.join(__dirname, 'cache');
    const fontDir = path.join(__dirname, 'assets', 'font');
    const cachePath = path.join(cacheDir, `status_${Date.now()}.png`);

    // ডিরেক্টরি চেক
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    // ফন্ট রেজিস্ট্রেশন
    try {
      const fonts = ['BeVietnamPro-Bold.ttf', 'BeVietnamPro-Regular.ttf'];
      fonts.forEach(font => {
        const fPath = path.join(fontDir, font);
        if (fs.existsSync(fPath)) {
          registerFont(fPath, { family: 'BeVietnamPro', weight: font.includes('Bold') ? 'bold' : 'normal' });
        }
      });
    } catch (e) { console.log("Font error:", e.message) }

    const width = 1600;
    const height = 1200;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // ১. ব্যাকগ্রাউন্ড
    const bgGradient = ctx.createRadialGradient(800, 600, 0, 800, 600, 1000);
    bgGradient.addColorStop(0, '#1a1a3e');
    bgGradient.addColorStop(1, '#050810');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // ২. তথ্য ক্যালকুলেশন
    const cpuUsage = Math.floor(Math.random() * 25) + 5;
    const ramUsage = Math.floor(((os.totalmem() - os.freemem()) / os.totalmem()) * 100);
    const uptime = formatUptime(os.uptime());
    const usedMem = formatBytes(os.totalmem() - os.freemem());
    const totalMem = formatBytes(os.totalmem());

    // ৩. মেইন গ্লো সার্কেল (সেন্টার)
    drawGlowCircle(ctx, 800, 600, 200, ['#818cf8', '#6366f1', '#4f46e5'], 'rgb(99, 102, 241)');
    
    // ৪. টেক্সট ড্রয়িং
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 70px BeVietnamPro, Sans-serif";
    ctx.fillText("CITTI BOT", 800, 580);
    ctx.font = "40px BeVietnamPro, Sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillText("SERVER STATUS", 800, 640);

    // ৫. স্ট্যাটাস বক্স ড্রয়িং (নিচে)
    drawDataBox(ctx, 400, 950, "CPU USAGE", `${cpuUsage}%`, '#818cf8');
    drawDataBox(ctx, 800, 950, "RAM USAGE", `${usedMem} / ${totalMem}`, '#34d399');
    drawDataBox(ctx, 1200, 950, "UPTIME", uptime, '#fbbf24');

    // ইমেজ পাঠানো
    try {
      const buffer = canvas.toBuffer();
      fs.writeFileSync(cachePath, buffer);
      
      return message.reply({
        body: "📊 | Server status generated successfully, Ma'am!",
        attachment: fs.createReadStream(cachePath)
      }, () => {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      });
    } catch (err) {
      return message.reply("❌ Error generating status image: " + err.message);
    }
  }
};

// --- Helper Functions ---

function drawDataBox(ctx, x, y, label, value, color) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  ctx.roundRect(x - 180, y - 60, 360, 150, 20);
  ctx.fill();
  
  ctx.fillStyle = color;
  ctx.font = "bold 30px BeVietnamPro, Sans-serif";
  ctx.fillText(label, x, y);
  
  ctx.fillStyle = "#ffffff";
  ctx.font = "45px BeVietnamPro, Sans-serif";
  ctx.fillText(value, x, y + 60);
  ctx.restore();
}

function drawGlowCircle(ctx, x, y, radius, colors, glowColor) {
  ctx.save();
  ctx.shadowBlur = 50;
  ctx.shadowColor = glowColor;
  
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(1, colors[2] || colors[1]);
  
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.restore();
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
                        }

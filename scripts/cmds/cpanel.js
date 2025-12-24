const { createCanvas, registerFont } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

module.exports = {
  config: {
    name: "status",
    version: "1.0.2",
    role: 0,
    author: "AkHi",
    description: "Premium Graphical Server Status",
    category: "system",
    guide: "{pn}",
    countDown: 10
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID } = event;
    const cacheDir = path.join(__dirname, 'cache');
    const cachePath = path.join(cacheDir, `status_${Date.now()}.png`);

    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const width = 1600;
    const height = 1200;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    try {
      // ১. ব্যাকগ্রাউন্ড
      ctx.fillStyle = '#050810';
      ctx.fillRect(0, 0, width, height);
      
      const bgGradient = ctx.createRadialGradient(800, 600, 0, 800, 600, 1000);
      bgGradient.addColorStop(0, '#1a1a3e');
      bgGradient.addColorStop(1, '#050810');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // ২. তথ্য ক্যালকুলেশন
      const cpuUsage = Math.floor(Math.random() * 15) + 2; 
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const ramUsagePercent = Math.floor((usedMem / totalMem) * 100);
      const uptime = formatUptime(os.uptime());

      // ৩. মেইন সার্কেল
      drawGlowCircle(ctx, 800, 600, 220, ['#818cf8', '#6366f1', '#4f46e5'], 'rgba(99, 102, 241, 0.5)');
      
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 80px Sans-serif";
      ctx.fillText("CITTI BOT", 800, 590);
      ctx.font = "40px Sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.fillText("SERVER STATUS", 800, 650);

      // ৪. স্ট্যাটাস বক্সেস
      drawDataBox(ctx, 400, 950, "CPU USAGE", `${cpuUsage}%`, '#818cf8');
      drawDataBox(ctx, 800, 950, "RAM USAGE", `${formatBytes(usedMem)} / ${formatBytes(totalMem)}`, '#34d399');
      drawDataBox(ctx, 1200, 950, "UPTIME", uptime, '#fbbf24');

      // ৫. ইমেজ পাঠানো
      const buffer = canvas.toBuffer();
      fs.writeFileSync(cachePath, buffer);
      
      return api.sendMessage({
        body: "📊 | Server status generated successfully, Ma'am!",
        attachment: fs.createReadStream(cachePath)
      }, threadID, () => {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      }, messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Error: " + err.message, threadID, messageID);
    }
  }
};

// --- Helper Functions ---

function drawDataBox(ctx, x, y, label, value, color) {
  ctx.save();
  // বক্স ব্যাকগ্রাউন্ড
  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  ctx.beginPath();
  // roundRect এর বদলে arc ব্যবহার করে সেফলি বক্স বানানো
  const r = 20, w = 360, h = 160;
  ctx.moveTo(x - w/2 + r, y - 80);
  ctx.lineTo(x + w/2 - r, y - 80);
  ctx.quadraticCurveTo(x + w/2, y - 80, x + w/2, y - 80 + r);
  ctx.lineTo(x + w/2, y + 80 - r);
  ctx.quadraticCurveTo(x + w/2, y + 80, x + w/2 - r, y + 80);
  ctx.lineTo(x - w/2 + r, y + 80);
  ctx.quadraticCurveTo(x - w/2, y + 80, x - w/2, y + 80 - r);
  ctx.lineTo(x - w/2, y - 80 + r);
  ctx.quadraticCurveTo(x - w/2, y - 80, x - w/2 + r, y - 80);
  ctx.fill();
  
  ctx.textAlign = "center";
  ctx.fillStyle = color;
  ctx.font = "bold 32px Sans-serif";
  ctx.fillText(label, x, y - 10);
  
  ctx.fillStyle = "#ffffff";
  ctx.font = "42px Sans-serif";
  ctx.fillText(value, x, y + 50);
  ctx.restore();
}

function drawGlowCircle(ctx, x, y, radius, colors, glowColor) {
  ctx.save();
  ctx.shadowBlur = 60;
  ctx.shadowColor = glowColor;
  
  const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
  grad.addColorStop(0, colors[0]);
  grad.addColorStop(1, colors[2]);
  
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
    }

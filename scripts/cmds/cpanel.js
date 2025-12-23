const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

const fontDir = path.join(__dirname, 'assets', 'font');
const cacheDir = path.join(__dirname, 'cache');

// ফন্ট রেজিস্ট্রেশন (নিশ্চিত করুন আপনার assets/font ফোল্ডারে এই ফাইলগুলো আছে)
registerFont(path.join(fontDir, 'BeVietnamPro-Bold.ttf'), { family: 'BeVietnamPro', weight: 'bold' });
registerFont(path.join(fontDir, 'BeVietnamPro-SemiBold.ttf'), { family: 'BeVietnamPro', weight: '600' });
registerFont(path.join(fontDir, 'BeVietnamPro-Regular.ttf'), { family: 'BeVietnamPro', weight: 'normal' });
registerFont(path.join(fontDir, 'NotoSans-Bold.ttf'), { family: 'NotoSans', weight: 'bold' });
registerFont(path.join(fontDir, 'NotoSans-SemiBold.ttf'), { family: 'NotoSans', weight: '600' });

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawGlowCircle(ctx, x, y, radius, colors, glowColor, glowSize = 30) {
    ctx.save();
    for (let i = glowSize; i > 0; i--) {
        const alpha = (1 - i / glowSize) * 0.15;
        ctx.beginPath();
        ctx.arc(x, y, radius + i, 0, Math.PI * 2);
        ctx.fillStyle = glowColor.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
        ctx.fill();
    }
    const gradient = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(0.7, colors[1]);
    gradient.addColorStop(1, colors[2] || colors[1]);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
}

function drawProgressArc(ctx, x, y, radius, progress, bgColor, fillColor, lineWidth = 8) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, -Math.PI * 0.75, Math.PI * 0.75);
    ctx.strokeStyle = bgColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
    if (progress > 0) {
        const sweepAngle = (Math.PI * 1.5) * (progress / 100);
        ctx.beginPath();
        ctx.arc(x, y, radius, -Math.PI * 0.75, -Math.PI * 0.75 + sweepAngle);
        ctx.strokeStyle = fillColor;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.stroke();
    }
    ctx.restore();
}

function drawConnectingLine(ctx, x1, y1, x2, y2, color) {
    ctx.save();
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, 'rgba(255,255,255,0.05)');
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, 'rgba(255,255,255,0.05)');
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
}

function drawIcon(ctx, x, y, size, type, color = 'rgba(255,255,255,0.9)') {
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const scale = size / 24;
    ctx.translate(x - 12 * scale, y - 12 * scale);
    ctx.scale(scale, scale);
    
    // আইকন ড্রয়িং লজিক (সংক্ষিপ্ত)
    switch(type) {
        case 'server': ctx.strokeRect(4, 3, 16, 18); break;
        case 'cpu': ctx.strokeRect(6, 6, 12, 12); break;
        case 'ram': ctx.strokeRect(2, 7, 20, 10); break;
        case 'storage': ctx.ellipse(12, 12, 8, 10, 0, 0, Math.PI * 2); ctx.stroke(); break;
        case 'bandwidth': ctx.moveTo(3, 17); ctx.lineTo(21, 7); ctx.stroke(); break;
        case 'domain': ctx.arc(12, 12, 9, 0, Math.PI * 2); ctx.stroke(); break;
        case 'ssl': ctx.strokeRect(5, 11, 14, 9); break;
        case 'email': ctx.strokeRect(2, 5, 20, 14); break;
        case 'ftp': ctx.moveTo(12, 4); ctx.lineTo(12, 16); ctx.stroke(); break;
        case 'database': ctx.ellipse(12, 12, 7, 9, 0, 0, Math.PI * 2); ctx.stroke(); break;
        case 'uptime': ctx.arc(12, 12, 9, 0, Math.PI * 2); ctx.stroke(); break;
        case 'visitors': ctx.arc(12, 8, 4, 0, Math.PI * 2); ctx.stroke(); break;
    }
    ctx.restore();
}

async function generateCpanelCard(botName = "CITTI BOT") {
    const width = 1600;
    const height = 1200;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const centerX = width / 2;
    const centerY = height / 2;

    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, height);
    bgGradient.addColorStop(0, '#1a1a3e');
    bgGradient.addColorStop(1, '#050810');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    const cpuUsage = getRandomInt(15, 45);
    const ramUsage = getRandomInt(30, 65);
    const uptime = os.uptime();
    const totalMem = os.totalmem();
    const usedMem = totalMem - os.freemem();

    const infoCircles = [
        { title: 'SERVER', icon: 'server', value: 'Online', sub: 'US-East', colors: ['#34d399', '#10b981'], glow: 'rgb(16, 185, 129)' },
        { title: 'CPU', icon: 'cpu', value: `${cpuUsage}%`, sub: `${os.cpus().length} Cores`, colors: ['#818cf8', '#6366f1'], glow: 'rgb(99, 1
            

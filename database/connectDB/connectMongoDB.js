/**
 * @param {string} uriConnect - MongoDB Connection String
 */
module.exports = async function (uriConnect) {
	const mongoose = require("mongoose");

	// ক্লাউড ইউআরআই যদি প্যারামিটার হিসেবে না আসে, তবে সরাসরি আপনার লিঙ্কটি ব্যবহার করবে
	const mongoURI = uriConnect || "mongodb+srv://shahryarsabu_db_user:8wKHzzXFdeX3zlEK@cluster0.rbclxsq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

	const threadModel = require("../models/mongodb/thread.js");
	const userModel = require("../models/mongodb/user.js");
	const dashBoardModel = require("../models/mongodb/userDashBoard.js");
	const globalModel = require("../models/mongodb/global.js");

	try {
		// MongoDB Cloud-এ কানেক্ট করার চেষ্টা
		await mongoose.connect(mongoURI, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		});
		
		console.log("✅ [DATABASE] MongoDB Cloud Connected Successfully!");
		console.log("🚀 ব্যালেন্স এবং ডাটা এখন থেকে ক্লাউডে সুরক্ষিত থাকবে।");
	} catch (error) {
		console.error("❌ [DATABASE] MongoDB Connection Error: ", error.message);
		// কানেকশন ফেইল হলে বট যেন ক্রাশ না করে তার জন্য এরর হ্যান্ডেল করা হয়েছে
	}

	return {
		threadModel,
		userModel,
		dashBoardModel,
		globalModel
	};
};

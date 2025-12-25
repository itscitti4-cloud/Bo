const mongoose = require("mongoose");

module.exports = async function (uriConnect) {
    // আপনার স্ক্রিনশট থেকে সংগৃহীত চূড়ান্ত এবং সঠিক লিঙ্ক
    const mongoURI = "mongodb+srv://shahryarsabu_db_user:7jYCAFNDGkemgYQI@cluster0.rbclxsq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    const threadModel = require("../models/mongodb/thread.js");
    const userModel = require("../models/mongodb/user.js");
    const dashBoardModel = require("../models/mongodb/userDashBoard.js");
    const globalModel = require("../models/mongodb/global.js");

    try {
        // কানেক্ট করার সময় কোনো অতিরিক্ত অপশন (useNewUrlParser ইত্যাদি) ব্যবহার করা হয়নি
        await mongoose.connect(mongoURI);
        
        console.log("✅ [DATABASE] MongoDB Cloud Connected Successfully!");
    } catch (error) {
        // যদি এখনও এরর আসে তবে সেটি এখানে দেখাবে
        console.error("❌ [DATABASE] MongoDB Connection Error: ", error.message);
    }

    return {
        threadModel,
        userModel,
        dashBoardModel,
        globalModel
    };
};

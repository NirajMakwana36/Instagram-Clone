const mongoose = require("mongoose");

const connectToDb = () => {
    mongoose.connect(process.env.MONGO_URI)
    .then(() => {{
        console.log("Connected to Mongodb");
    }})
    .catch((err) => {
        console.error(err);
    }) 
}

// testConnection()
// .then(res => console.log("Connection test complete"))
// .catch(err => console.error("Connection test failed", err));

// async function testConnection() {
//         await mongoose.connect(process.env.MONGO_URI);
//         console.log("Connected to Mongodb");
// }

module.exports = connectToDb;
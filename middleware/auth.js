const jwt = require('jsonwebtoken');
const user = require('../models/user');

const auth = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json({
            message: "You must logged in"
        })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        return next();
    } catch (err) {
        console.error(err);
    }
}

module.exports = auth;
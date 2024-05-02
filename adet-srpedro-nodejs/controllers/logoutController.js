const {deleteRefreshToken} = require('../functions/database');

async function handleLogout(req,res){
    const refreshToken = req.body.refreshToken
    const username = req.body.username
    console.log(refreshToken,username)
    await deleteRefreshToken(username,refreshToken)
    return res.status(200).json({ message: "Logged out successfully" });
}

module.exports = {handleLogout}
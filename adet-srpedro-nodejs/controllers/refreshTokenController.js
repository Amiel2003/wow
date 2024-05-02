const jwt = require('jsonwebtoken');
const {updateRefreshTokens, retrieveRefreshTokens} = require('../functions/database');

async function handleRefreshTokens(req,res){
      try {
     // take refresh token from user
  const refreshToken = req.body.token

  if(!refreshToken) return res.status(401).json({ message: 'Not authenticated' });
  const arrayRefreshTokens = await retrieveRefreshTokens(req.body.user.username)
  if(!arrayRefreshTokens.includes(refreshToken)){
    return res.status(403).json({ message: 'Token invalid' });
  }
  jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET,async(err,user)=>{
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    const inputs = req.body.user
    // Filter out the refreshToken from the arrayRefreshTokens
    let updatedRefreshTokens = arrayRefreshTokens.filter((token) => token !== refreshToken);

    const newAccessToken = jwt.sign(inputs, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_TIME });
    const newRefreshToken = jwt.sign(inputs, process.env.REFRESH_TOKEN_SECRET);
    
    updatedRefreshTokens.push(newRefreshToken)
    // Update the database with the modified array of refresh tokens
    await updateRefreshTokens(req.body.user.username, updatedRefreshTokens);
    console.log("This indicates that refresh route is working")
    res.status(200).json({
      access_token: newAccessToken,
      refresh_token: newRefreshToken
    });
  })
  } catch (error) {
    console.log(error)
    return res.status(403).json({ message: 'Errorrrrsssasa' });
  }
}

module.exports = {handleRefreshTokens}
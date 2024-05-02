
function showAuthorization(req,res){
    return res.status(200).json({ message: "You are authorized" });
}

module.exports = {showAuthorization}
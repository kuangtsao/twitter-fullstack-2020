const tweetsController = {
  getTweets: (req, res) => {
    console.log(res.locals.user)
    return res.render('index')
  }
}
module.exports = tweetsController

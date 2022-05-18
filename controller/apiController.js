const { User } = require('../models')
const helpers = require('../_helpers')

const imgur = require('imgur')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
imgur.setClientId(IMGUR_CLIENT_ID)

const apiController = {
  editUser: async (req, res, next) => {
    try {
      const loginUserId = helpers.getUser(req) && helpers.getUser(req).id
      // 修改名字 和 自我介紹內容
      const { name, introduction } = req.body

      if (!name) return res.json({ status: 'error', message: '名字要寫' })
      if (name.length > 50) return res.json({ status: 'error', message: '名字字數不能超過 50 字' })
      if (introduction.length >= 160) return res.json({ status: 'error', message: '自介不能超過 160 字' })

      // 修改背景圖
      const rawFiles = JSON.stringify(req.files)
      const files = JSON.parse(rawFiles)
      let imgurCover
      let imgurAvatar

      if (Object.keys(files).length === 0) {
        imgurCover = 0
        imgurAvatar = 0
      } else if (typeof files.cover === 'undefined' && typeof files.avatar !== 'undefined') {
        // 如果只有更新 avatar
        imgurCover = 0
        imgurAvatar = await imgur.uploadFile(files.avatar[0].path)
      } else if (typeof files.cover !== 'undefined' && typeof files.avatar === 'undefined') {
        // 如果只有更新 cover
        imgurAvatar = 0
        imgurCover = await imgur.uploadFile(files.cover[0].path)
      } else { // 如果都有更新
        imgurCover = await imgur.uploadFile(files.cover[0].path)
        imgurAvatar = await imgur.uploadFile(files.avatar[0].path)
      }

      await User.update(
        {
          name,
          introduction,
          cover: imgurCover?.link || User.cover,
          avatar: imgurAvatar?.link || User.avatar
        }, {
          where: {
            id: loginUserId
          }
        })
      // req.flash('sucesss_messages', '更改成功！')
        return res.json({ status: 'success', upadteUser })
    } catch (err) {
      next(err)
    }
  }
}
module.exports = apiController

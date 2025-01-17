'use strict'

const bcrypt = require('bcryptjs')
const faker = require('faker')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 指定帳號
    await queryInterface.bulkInsert(
      'Users',
      [
        {
          id: 1,
          name: 'root',
          email: 'root@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          account: 'root',
          cover: `https://picsum.photos/200/300?random=${Math.random() * 100}`,
          avatar: `https://picsum.photos/200/300?random=${Math.random() * 100}`,
          introduction: faker.lorem.text().substring(0, 160),
          role: 'admin',
          isAdmin: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 2,
          name: 'user1',
          email: 'user1@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          account: 'user1',
          cover: `https://picsum.photos/639/200?random=${Math.random() * 100}`,
          avatar: `https://picsum.photos/200/300?random=${Math.random() * 100}`,
          introduction: faker.lorem.text().substring(0, 160),
          role: 'user',
          isAdmin: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    )
    // 隨機帳號
    await queryInterface.bulkInsert(
      'Users',
      Array.from({ length: 4 }).map((_, i) => ({
        id: i + 3,
        name: faker.name.findName(),
        email: faker.internet.email(),
        password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
        account: faker.name.findName(),
        cover: `https://picsum.photos/200/300?random=${Math.random() * 100}`,
        avatar: `https://picsum.photos/200/300?random=${Math.random() * 100}`,
        introduction: faker.lorem.text().substring(0, 160),
        role: 'user',
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      {}
    )
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {})
  }
}

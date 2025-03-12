const express = require("express")
const bcrypt = require("bcrypt")

const router = express.Router()
const { dataSource } = require("../db/data-source")
const logger = require("../utils/logger")("User")

const { isNotValidString, isValidPassword,isUndefined} = require("../utils/formatValid")
const saltRounds = 10;

const generateJWT = require('../utils/generateJWT')
const auth = require('../middlewares/auth')({
  secret: config.get('secret').jwtSecret,
  userRepository: dataSource.getRepository('User'),
  logger
})

router.post("/signup", async (req, res, next) =>{
    try{
        const {name, email, password} = req.body
        if (isNotValidString(name) || isNotValidString(email) || isNotValidString(password)){
            res.status(400).json({
                status : "failed",
                message: "欄位未填寫正確"
            });
            return;
        }
        if (!isValidPassword(password)){
            res.status(400).json({
                status : "failed",
                message: "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"
            });
            return;        
        }
        const UserRepo = await dataSource.getRepository("User")
        const existUser = await UserRepo.find({
            where:{email: email}
        })
        if (existUser.length > 0){
            res.status(409).json({
                status : "failed",
                message: "Email已被使用"
            });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = await UserRepo.create({
            name: name,
            email: email,
            password: hashedPassword,
            role: "USER"
        })
        const result = await UserRepo.save(newUser)
        res.status(201).json({
            status: "success",
            data: {
                id: result.id,
                name: result.name
            }
        });
    }catch(error){
        logger.error(error)
        next(error);
    }
})
// 打這支 45:19，才會得到token
router.post('/login', async (req, res, next) => {
    try {
      const { email, password } = req.body
      if (isUndefined(email) || isNotValidString(email) || isUndefined(password) || isNotValidString(password)) {
        logger.warn('欄位未填寫正確')
        res.status(400).json({
          status: 'failed',
          message: '欄位未填寫正確'
        })
        return
      }
      if (!isValidPassword(password)) {
        logger.warn('密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字')
        res.status(400).json({
          status: 'failed',
          message: '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'
        })
        return
      }
      const userRepository = dataSource.getRepository('User')
      const existingUser = await userRepository.findOne({
        select: ['id', 'name', 'password'],
        where: { email }
      })
  
      if (!existingUser) {
        res.status(400).json({
          status: 'failed',
          message: '使用者不存在或密碼輸入錯誤'
        })
        return
      }
      logger.info(`使用者資料: ${JSON.stringify(existingUser)}`)
      const isMatch = await bcrypt.compare(password, existingUser.password)
      if (!isMatch) {
        res.status(400).json({
          status: 'failed',
          message: '使用者不存在或密碼輸入錯誤'
        })
        return
      }
      const token = await generateJWT({
        id: existingUser.id
      }, config.get('secret.jwtSecret'), {
        expiresIn: `${config.get('secret.jwtExpiresDay')}`
      })
  
      res.status(201).json({
        status: 'success',
        data: {
          token,
          user: {
            name: existingUser.name
          }
        }
      })
    } catch (error) {
      logger.error('登入錯誤:', error)
      next(error)
    }
})
// 打這支 55:00，記得輸入token，1:04:31(Authorization/type-Bearer To...) 
router.get('/profile', auth, async (req, res, next) => {
    try {
      const { id } = req.user
      const userRepository = dataSource.getRepository('User')
      const user = await userRepository.findOne({
        select: ['name', 'email'],
        where: { id }
      })
      res.status(200).json({
        status: 'success',
        data: {
          user
        }
      })
    } catch (error) {
      logger.error('取得使用者資料錯誤:', error)
      next(error)
    }
})
// 打這支，跟get一樣要帶token 
router.put('/profile', auth, async (req, res, next) => {
    try {
      const { id } = req.user
      const { name } = req.body
      if (isUndefined(name) || isNotValidString(name)) {
        logger.warn('欄位未填寫正確')
        res.status(400).json({
          status: 'failed',
          message: '欄位未填寫正確'
        })
        return
      }
      const userRepository = dataSource.getRepository('User')
      const user = await userRepository.findOne({
        select: ['name'],
        where: {
          id
        }
      })
      if (user.name === name) {
        res.status(400).json({
          status: 'failed',
          message: '使用者名稱未變更'
        })
        return
      }
      const updatedResult = await userRepository.update({
        id,
        name: user.name
      }, {
        name
      })
      if (updatedResult.affected === 0) {
        res.status(400).json({
          status: 'failed',
          message: '更新使用者資料失敗'
        })
        return
      }
      const result = await userRepository.findOne({
        select: ['name'],
        where: {
          id
        }
      })
      res.status(200).json({
        status: 'success',
        data: {
          user: result
        }
      })
    } catch (error) {
      logger.error('取得使用者資料錯誤:', error)
      next(error)
    }
})

module.exports = router
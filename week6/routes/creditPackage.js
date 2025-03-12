const express = require('express')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('CreditPackage')
const { isNotValidInteger, isNotValidString, isUndefined } = require("../utils/formatValid")

const auth = require('../middlewares/auth')({
  secret: config.get('secret').jwtSecret,
  userRepository: dataSource.getRepository('User'),
  logger
})

router.get('/', async (req, res, next) => {
    try {
        const packages = await dataSource.getRepository("CreditPackage").find({
          select: ["id", "name", "credit_amount", "price"]
        })
            res.status(200).json({
                status: "success",
                data: packages
            });
      }catch (error){
        logger.error(error)
        next(error);
    }
})

router.post('/', async (req, res, next) => {
    try {
        const {name, credit_amount, price} = req.body;
        if (isNotValidString(name) || isNotValidInteger(credit_amount) || isNotValidInteger(price)){
          res.status(400).json({
            status: "failed",
            message: "欄位未填寫正確"
          })
          return;
        }
        const CreditPackageRepo = await dataSource.getRepository("CreditPackage")
        const existPackage = await CreditPackageRepo.find({
          where: {
            name: name
          }
        })
        if (existPackage.length > 0){
            res.status(409).json({
                status: "failed",
                message: "資料重複"
            })
          return
        }
        const newPackage = await CreditPackageRepo.create({
          name: name,
          credit_amount: credit_amount,
          price: price
        })
        const result = await CreditPackageRepo.save(newPackage)
        res.status(200).json({
            status: "success",
            data: result
        })
      }catch (error){
        logger.error(error)
        next(error);
      }
})

//打這個，這是新的
router.post('/:creditPackageId', auth, async (req, res, next) => {
  try {
    const { id } = req.user
    const { creditPackageId } = req.params
    const creditPackageRepo = dataSource.getRepository('CreditPackage')
    const creditPackage = await creditPackageRepo.findOne({
      where: {
        id: creditPackageId
      }
    })
    if (!creditPackage) {
      res.status(400).json({
        status: 'failed',
        message: 'ID錯誤'
      })
      return
    }
    const creditPurchaseRepo = dataSource.getRepository('CreditPurchase')
    const newPurchase = await creditPurchaseRepo.create({
      user_id: id,
      credit_package_id: creditPackageId,
      purchased_credits: creditPackage.credit_amount,
      price_paid: creditPackage.price,
      purchaseAt: new Date().toISOString()
    })
    await creditPurchaseRepo.save(newPurchase)
    res.status(200).json({
      status: 'success',
      data: null
    })
  } catch (error) {
    logger.error(error)
    next(error)
  }
})

router.delete('/:creditPackageId', async (req, res, next) => {
    try {
        const { creditPackageId }  = req.params;
        if (isNotValidString(creditPackageId)){
            res.status(400).json({
                status: "failed",
                message: "ID錯誤"
            })
          return
        }
        const result = await dataSource.getRepository("CreditPackage").delete(creditPackageId)
        if (result.affected === 0){ 
            res.status(400).json({
                status: "failed",
                message: "ID錯誤"
            })
          return
        } 
        res.status(200).json({
            status: "success"
        })
      }catch (error){
        logger.error(error)
        next(error);
      }
})

module.exports = router

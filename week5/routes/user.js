const express = require("express")
const bcrypt = require("bcrypt")

const router = express.Router()
const { dataSource } = require("../db/data-source")
const logger = require("../utils/logger")("User")

const { isNotValidInteger, isNotValidString, isValidPassword} = require("../utils/formatValid")
const saltRounds = 10;

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

module.exports = router
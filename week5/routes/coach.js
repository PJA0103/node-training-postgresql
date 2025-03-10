const express = require("express")

const router = express.Router()
const {dataSource} = require("../db/data-source")
const logger = require("../utils/logger")("Coach")

const {isNotValidInteger, isNotValidString, } = require("../utils/formatValid")
const User = require("../entities/User")
const Coach = require("../entities/Coach")

router.get("/", async (req, res, next) => {
    const {per, page} = req.query
    try{
        if(isNotValidString(per) || isNotValidString(page)) {
            res.status(400).json({
                status: 'failed',
                message: '欄位未填寫正確'
            })
            return
        }
        const currentPage = parseInt(page, 10);
        const pageSize = parseInt(per, 10);
        if(isNotValidInteger(currentPage) || isNotValidInteger(pageSize)){
            res.status(400).json({
                status: 'failed',
                message: '欄位未填寫正確'
            })
            return  
        }
        const coaches = await dataSource.getRepository("Coach").find();
        const coachUser = await dataSource.getRepository("User").find({
            where: {role: "COACH"}
        });
        const coachList = [];
        coaches.forEach(coach => {
            const user = coachUser.find(user => user.id === coach.user_id);
            if (user) {
              coachList.push({ id: coach.user_id, name: user.name });
            }
          });
            res.status(200).json({
                status: "success",
                data: coachList
            })
            return
        }catch(error){
        logger.error(error)
        next(error)
    }
})

router.get("/:coachId",async (req, res, next) =>{
    try{
        const {coachId} = req.params
        if(isNotValidString(coachId)){
            res.status(400).json({
                status: "failed",
                message: "欄位未填寫正確"
            })
            return
        }
        const coachInfo = await dataSource.getRepository("Coach").find({
            where: {user_id: coachId}
        });
        if(!coachInfo || coachInfo.length ===0){
            res.status(400).json({
                status: "failed",
                message: "找不到該教練"
            })
            return
        }
        const userInfo = await dataSource.getRepository("User").find({
            where: {id: coachId}
        });
        if (userInfo && userInfo.length > 0){
            userInfo[0] ={
                name: userInfo[0].name,
                role: userInfo[0].role
            }
            res.status(200).json({
                status: "success",
                data:{
                    user: userInfo,
                    coach: coachInfo
                } 
            })
            return
        }
    }catch(error){
        logger.error(error);       
        next(error);
    }
})

module.exports = router

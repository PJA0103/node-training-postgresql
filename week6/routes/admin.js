const express = require("express")

const router = express.Router()
const {dataSource} = require("../db/data-source")
const logger = require("../utils/logger")("Admin")

const {isNotValidInteger, isNotValidString, isValidImage, isValidWebsite, isValidTimestamp, isUndefined} = require("../utils/formatValid")
const User = require("../entities/User")
const auth = require('../middlewares/auth')({
    secret: config.get('secret').jwtSecret,
    userRepository: dataSource.getRepository('User'),
    logger
  })
  const isCoach = require('../middlewares/isCoach')
//打這支
router.post("/course" ,auth ,isCoach, async (req, res, next) => {
    try{
        const {id} = req.user
        const { user_id, skill_id, name, description, start_at, end_at, max_participants, meeting_url } = req.body
        if(isNotValidString(name) || isNotValidString(description) || !isValidTimestamp(start_at) || !isValidTimestamp(end_at) || isNotValidInteger(max_participants) || isNotValidString(meeting_url) || !isValidWebsite(meeting_url) ){
            logger.warn('欄位未填寫正確')
            res.status(400).json({
                status: "failed",
                message: "欄位未填寫正確"
            })
            return
        }
        const UserRepo = await dataSource.getRepository("User")
        const existUser = await UserRepo.findOne({
            where: {id: user_id}
        })
        if(!existUser){
            logger.warn('使用者不存在')
            res.status(400).json({
                status: "failed",
                message: "使用者不存在"
            })
            return
        } else if (existUser.role !== "COACH"){
            logger.warn('使用者尚未成為教練')
            res.status(400).json({
                status: 'failed',
                message: '使用者尚未成為教練'
            })
            return
        }
        const courseRepo = await dataSource.getRepository("Course")
        const newCourse = await courseRepo.create({
            user_id, skill_id, name, description, start_at, end_at, max_participants, meeting_url
        })
        const result = await courseRepo.save(newCourse)
        res.status(201).json({
            status: "success",
            data:{
                result
            }
        })
        return
    }catch(error){
        logger.error(error)
        next(error)
    }
})   
//打這支
router.put("/courses/:courseId" ,auth ,isCoach, async (req, res, next) =>{
    try{
        const {courseId} = req.params
        const { user_id, skill_id, name, description, start_at, end_at, max_participants, meeting_url } = req.body
        if(isNotValidString(name) || isNotValidString(description) || !isValidTimestamp(start_at) || !isValidTimestamp(end_at) || isNotValidInteger(max_participants) || isNotValidString(meeting_url) || !isValidWebsite(meeting_url) ){
            logger.warn('欄位未填寫正確')
            res.status(400).json({
                status: "failed",
                message: "欄位未填寫正確"
            })
            return
        }
        const courseRepo = await dataSource.getRepository("Course")
        const existCourse = await courseRepo.findOne({
            where:{id: courseId}
        })
        if(!existCourse){
            logger.warn('課程不存在')
            res.status(400).json({
                status : "failed",
                message: "課程不存在"
            })
            return
        }
        const updateCourse = await courseRepo.update({
            id: courseId
        },{
            skill_id, name, description, start_at, end_at, max_participants, meeting_url
        })
        if (updateCourse.affected ===0 ){
            logger.warn('更新課程失敗')
            res.status(400).json({
                "status" : "failed",
                "message": "更新課程失敗"
            })
            return
        }
        const result = await courseRepo.findOne({
            where:{id :courseId}
        })
        res.status(201).json({
            status: "success",
            data: {
                course :result
            }
        })
    }catch(error){
        logger.error(error);
        next(error);
    }
})
//試試看應該是沒壞掉
router.post("/:userId", async (req, res, next) =>{
    try{
        const { userId } = req.params
        const { experience_years, description, profile_image_url } = req.body
        if ( isNotValidString(userId) || isNotValidInteger(experience_years) || isNotValidString(description)){
            logger.warn('欄位未填寫正確')
            res.status(400).json({
                status : "failed",
                message: "欄位未填寫正確"
            });
            return
        }
        if (profile_image_url){
            if((isNotValidString(profile_image_url) || !isValidImage(profile_image_url) || !profile_image_url.startsWith("http"))){
                logger.warn('欄位未填寫正確')
                res.status(400).json({
                    status : "failed",
                    message: "欄位未填寫正確"
            })
            return
        }}
        const UserRepo = await dataSource.getRepository("User")
        const existUser = await UserRepo.findOne({
            where: {id: userId}
        })
        if (!existUser){
            logger.warn('使用者不存在')
            res.status(400).json({
                status: "failed",
                message: "使用者不存在"
            });
            return
        }
        if (existUser.role === "COACH"){
            logger.warn('使用者已經是教練')
            res.status(409).json({
                status: "failed",
                message: "使用者已經是教練"
            })
            return
        }
        const updateRole = await UserRepo.update({
            id: userId
        },{
            role: "COACH"
        })
        if (updateRole.affected === 0){
            logger.warn('更新使用者失敗')
            res.status(400).json({
                status : "failed",
                message: "更新使用者失敗"
            })
            return
        }
        const CoachRepo = await dataSource.getRepository("Coach")
        const newCoach = CoachRepo.create({
            user_id: userId, 
            experience_years,
            description,
            profile_image_url
        })
        const result = await CoachRepo.save(newCoach)
        const updatedUser = await UserRepo.findOne({
            where: {
                id: userId
            }
        })
        res.status(201).json({
            status: "success",
            data: {
                name: updatedUser.name,
                role: updatedUser.role
            }
        })
    }catch(error){      
        logger.error(error);
        next(error)
    }
})

module.exports = router
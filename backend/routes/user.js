const express = require('express')
const router = express.Router()
const {userSignUp,userLogin,getUser,changePassword, updateTheme}=require('../controller/user')
// const { changePassword } = require('../controller/usercontroller');
const verifyToken = require('../middleware/auth');

router.post('/signUp',userSignUp)
router.post('/login',userLogin)
router.get('/user/:id',getUser)
router.post('/change-password',verifyToken,changePassword)
router.put('/theme',verifyToken,updateTheme)



module.exports=router
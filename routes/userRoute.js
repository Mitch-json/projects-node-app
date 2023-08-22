const express = require('express');
const router = express();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { Result } = require('express-validator');
const cors = require('cors');

router.options('*', cors())

router.post('/profile', cors(), async (req, res)=>{
    const newHashedPassword = await bcrypt.hash(req.body.newPassword, 10);

    User.findOne({email: req.body.email}, (err, user)=>{
        if(err) throw err;
        if (user) {
            bcrypt.compare(req.body.oldPassword, user.password,async (err, result)=>{
                if(err) throw err;
                if(result){
                    try {
                        const update = await User.updateOne({email: req.body.email}, {password: newHashedPassword});
                        res.status(200).send({"msg": 'Password Sucessfully changed'});

                    } catch (error) {
                        res.send({"err": 'Password not updated'});
                    }
                }else{
                    res.status(200).send({err: 'incorrect old password'});
                }
            })
        }
    });
});

module.exports = router
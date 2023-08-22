const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const DOMAIN = 'sandbox5223439769d24251a4cb473b4827be1b.mailgun.org';
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const passport = require('passport');
const nodemailer = require('nodemailer');
const cors = require('cors');

router.options('*', cors())

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "mitchjaga@gmail.com",
      pass: "ljgyyzkwkzgbtljj",
    },
});

router.post('/login/google', cors(), async(req, res)=>{
    const {username, email, googleId} = req.body

    const defaultUser = {
        name: username,
        email: email,
        googleId: googleId
    }
    
    try {
        let user = await User.findOne({ googleId: googleId })

        if (user) {
          user = await User.updateOne({ googleId: googleId }, {name: username})
          let user2 = await User.findOne({ googleId: googleId })
          res.status(200).send({user: user2})
        } else {
          let userEmail = await User.findOne({ email: email})
          if (userEmail) {
            userEmail = await User.updateOne({email: email}, {googleId: googleId, name: username})
            let user2 = await User.findOne({ email: email })
            res.status(200).send({user: user2})
          } else {
            user = await User.create(defaultUser)
            res.status(200).send({user: user})
          }
        }
      } catch (err) {
        res.status(200).send({"err": err})
      }


})

router.post('/login/facebook', cors(), async(req, res)=>{
    const {username, email, facebookId} = req.body

    const defaultUser = {
        name: username,
        email: email,
        facebookId: facebookId
    }
    
    try {
        let user = await User.findOne({ facebookId: facebookId })

        if (user) {
          user = await User.updateOne({ facebookId: facebookId }, {name: username})
          let user2 = await User.findOne({ facebookId: facebookId })
          res.status(200).send({user: user2})
        } else {
          let userEmail = await User.findOne({ email: email})
          if (userEmail) {
            userEmail = await User.updateOne({email: email}, {facebookId: facebookId, name: username})
            let user2 = await User.findOne({ email: email })
            res.status(200).send({user: user2})
          } else {
            user = await User.create(defaultUser)
            res.status(200).send({user: user})
          }
        }
      } catch (err) {
        res.status(200).send({"err": err})
      }

})

router.post('/register', cors(), async (req, res)=>{
    const {name, email, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    

    User.findOne({email: email}, (err, user)=>{
        if (err) throw err;
        if(user){
            res.status(203).send({"message": 'Email already exists'});
        }else{
            const token = jwt.sign({name, email, password: hashedPassword}, process.env.JWT_ACC_ACTIVATE, {expiresIn: '20m'})

            const data = {
                from: 'mitchjaga@gmail.com',
                to: email,
                subject: 'Account Activation',
                html: `
                    <h2>Click the link below to activate your account</h2>
                    <a href=${process.env.CLIENT_URL}/authentication/activate/${token}>click here to activate your account</a>
                `
            };
            transporter.sendMail(data, function(error, info){
                if(error){
                    res.status(203).send({
                        "message": error.message
                    });
                }else{
                    res.status(200).send({
                        "message": 'Email has been sent, Kindly activate the account'
                    });
                }
            });
        }
    })
});

router.post("/send-message", cors(), (req, res)=>{
    const {name, email, message} = req.body;

    
    if (name && email) {
        const data = {
            from: 'mitchjaga@gmail.com',
            to: "mitchjaga77@gmail.com",
            subject: 'Contacting You about your services',
            html: `
                <h3>My Name: ${name}</h3>
                <h3>My Email: ${email}</h3>
                <p>Message: ${message}</P>
            `
        };
        transporter.sendMail(data, function(error, info){
            if(error){
                res.status(200).send({
                    "err": error.message
                });
            }else{
                res.status(200).send({
                    "msg": 'Email message has been sent successfully'
                });
            }
        });
    } else {
        res.status(200).send({
            "err": 'please ensure you fill in your name and email'
        });
    }


})

router.post('/password-reset/email', cors(), async (req, res)=>{
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    User.findOne({email: req.body.email}, (err, user)=>{
        if(err){
            throw err;
        }
        if(user){
            const token = jwt.sign({ email: req.body.email, password: hashedPassword}, process.env.JWT_RESET_PASSWORD, {expiresIn: '20m'})

            const data = {
                from: 'mitchjaga@gmail.com',
                to: req.body.email,
                subject: 'PASSWORD_RESET',
                html: `
                    <h2>Click the link below to reset your password</h2>
                    <a href=${process.env.CLIENT_URL}/password-reset/${token}>click here to reset your password</a>
                `
            };
            transporter.sendMail(data, function(error, info){
                if(error){
                    res.status(203).send({
                        "message": error.message
                    });
                }else{
                    res.status(200).send({
                        "message": 'Email has been sent, Kindly activate the account'
                    });
                }
            });
        }else{
            res.status(203).send({"err": 'Email does not exist'});
        }
    })
});

router.post('/login', cors(), passport.authenticate("local"), (req, res, next)=>{
    console.log(req.user)
    res.send(req.user);
});

router.get('/logout', cors(), (req, res)=>{
    req.logOut();
});


router.post('/email-activate', cors(), (req, res)=>{
    const {token} = req.body;
    console.log(req.body)
    if(token){
        jwt.verify(token, process.env.JWT_ACC_ACTIVATE,async (err, decodedToken)=>{
            if(err){
                res.status(400).send({"error": 'Invalid or Expired link'});
            }else{
                const {name, email, password } = decodedToken;

                const newUser = new User({ email: email, name: name, password: password});

                try {
                    await newUser.save()
                    res.status(200).send({"message": 'User Sucessfully Created'});  
                } catch (error) {
                    res.status(203).send({"err": 'Make sure all fields are filled'}); 
                }
        
            }
        })
    }else{
        res.header('Access-Control-Allow-Origin', '*');
        res.status(200).send({"error": 'Oops, Something went wrong'});
    }
});

router.post('/reset', cors(), (req, res)=>{
    const {token} = req.body;
    if(token){
        jwt.verify(token, process.env.JWT_RESET_PASSWORD,async (err, decodedToken)=>{
            if(err){
                res.status(203).send({"err": 'Invalid or Expired link'});
            }else{
                const {email, password } = decodedToken;

                try {
                    const update = await User.updateOne({email: email}, {password: password});
                    res.status(200).send({"msg": 'Password sucessfully reset'});

                } catch (error) {
                    res.status(203).send({"err": 'Password not updated'});
                }

            }
        })
    }else{
        res.status(200).send({error: 'Oops, Something went wrong'});
    }
});


module.exports = router;
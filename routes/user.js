// import dotenvJSON from "dotenv-json";
// dotenvJSON({
//     path: "../.env.json"
// });

import { UserController } from '../controllers';
import express from 'express';

import { check, validationResult} from "express-validator";
import bcrypt from "bcryptjs";
import crypto from 'crypto';
import jwt from "jsonwebtoken";
import { validateMobileNumber, validateOTP } from '../utilities/checkers';
import config from '../config/index';
import { verifyJWT_MW } from '../middlewares/auth-middleware';
import { generateOTP, sendOTP } from '../utilities/otps';
import Users from '../models/user';
import UserProfile from '../models/userProfile';

import _ from 'lodash';
import path from 'path';
import multer from 'multer';
import AvatarStorage from '../helpers/AvatarStorage';

let router = express.Router();

router.get(
    "/demo",
    async (req, res) => {
        return res.status(400).json({
            message: "Demo"
        });
    }
  )

  
router.post(
  "/login",
  async (req, res) => {
    const {
      phoneNumber,
    } = req.body;
    if(validateMobileNumber(phoneNumber)) {
      const OTP = generateOTP(config.OTP_DIGIT_LENGTH);
      let OTPStatus = await sendOTP(config.TwoFactorAPI, phoneNumber, OTP);
      //console.log(OTPStatus);
      try {
        let user = await Users.findOne({ phoneNumber });
        if (user) {
            let updatedUser = await Users.updateOne(
                {"phoneNumber": phoneNumber},
                { $set: {"OTP": OTP}}
            );
            return res.status(200).json({
                status: "pass",
                phoneNumber: user.phoneNumber
            });
        } else {
          user = new Users({ phoneNumber, OTP });
          await user.save();
          return res.status(200).json({
            status: "pass",
            phoneNumber: user.phoneNumber
          });
        }
    } catch (err) {
        res.status(500).send(err);
    }
    
    } else {
      return res.status(400).json({
        message: "Incorrect mobile number"
      });
    }
  }
)

router.post(
    "/otp-submit",
    async (req, res) => {
        try {
            const {
                phoneNumber,
                OTP
            } = req.body;
            if(validateMobileNumber(phoneNumber)) {
                if(validateOTP(OTP)) {
                    let user = await Users.findOne({ phoneNumber });
                    if(!user) {
                        return res.status(500).json({
                            "status": "fail",
                            "error": "Mobile number not found"
                        });
                    }
                    let userOTP = user.OTP.trim();
                    if(userOTP === OTP.trim()) {
                        const payload = { user: { id: user.id }};
                        jwt.sign(
                            payload,
                            config.JWT_SECRET, {
                                expiresIn: config.JWT_MAX_AGE
                            },
                            async (err, token) => {
                                let updatedUser = await Users.updateOne(
                                    {"phoneNumber": phoneNumber},
                                    { $set: {"OTP": ""}}
                                );
                                if (err) throw err;
                                return res.status(200).json({
                                    status: "pass",
                                    token,
                                    isRegistered: user.registered,
                                    id: user.id,
                                    phoneNumber: user.phoneNumber,
                                    name: user.name,
                                    type: user.type
                                });
                        });
                    }
                    else {
                        return res.status(500).json({
                            "status": "fail",
                            "error": "Wrong OTP"
                        });
                    }
                } else {
                    return res.status(500).json({
                        "status": "fail",
                        "error": "OTP number not valid",
                    });
                }
            } else {
                return res.status(500).json({
                    "status": "fail",
                    "error": "Mobile number not valid",
                });  
            }
        } catch (err) {
            console.log(err.message);
            res.status(500).send("Something went wrong");
        }
    }
);

router.post(
    "/submit-profile",
    async (req, res) => {
        try {
            const {name, sex, age, marritalStatus, education, experience, expertise ,state, city, imageID, phoneNumber} = req.body.profile;
            //console.log("phonenumber", phoneNumber)
            if(!phoneNumber) {
                return res.status(500).json({
                    "status": "fail",
                    "error": "Phone number not provided"
                });
            }
            let userReistered = await UserProfile.findOne({ phoneNumber });
            if(userReistered) {
                return res.status(500).json({
                    "status": "fail",
                    "error": "User already registered"
                });
            }
            let userProfle = new UserProfile({
                name,
                sex,
                age,
                marritalStatus,
                education,
                experience,
                expertise,
                state,
                city,
                imageID,
                phoneNumber
            });
            await userProfle.save();
            await Users.updateOne(
                {"phoneNumber": phoneNumber},
                { $set: {registered: true, name: name}}
            );
            return res.status(200).send({ name,
                sex,
                age,
                marritalStatus,
                education,
                experience,
                expertise,
                state,
                city,
                imageID,
                phoneNumber});

        } catch (err) {
            console.log(err.message);
            res.status(500).send("Something went wrong");
        }
    }
);

router.post(
    "/local/register",
    async (req, res) => {
        try {
            const { data } = req.body;
            if(data) {
                try {
                  await Users.updateOne(
                    {"phoneNumber": data.phoneNumber},
                    { $set: {registered: true, name: data.name, type: 'Local'}}
                  );
                  return res.status(200).json({
                    name: data.name,
                    result: "pass"
                  });
              } catch (err) {
                  return res.status(500).send("Error in Saving");
              }
              } else {
                return res.status(400).json({
                  message: "Error"
                });
              }
        } catch (err) {
            console.log(err.message);
            res.status(500).send("Something went wrong");
        }
    }
)
var upload = multer({
    storage: AvatarStorage({
        square: true,
        responsive: true,
        greyscale: true,
        quality: 90
    }),
    limits: {
        files: 1,
        fileSize: 200000 * 200000,
    },
    fileFilter: function(req, file, cb) {
         console.log("file", file)
        var allowedMimes = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/gif'];
        if (_.includes(allowedMimes, file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only jpg, png and gif image files are allowed.'));
        }
    }
});
router.post('/upload', upload.single("avatar"), function(req, res, next) {

    var files;
    var file = req.file.filename;
    console.log("file---",req.file);
    let imageID = req.file.filename.split("_")[0];
    var matches = file.match(/^(.+?)_.+?\.(.+)$/i);
    
    if (matches) {
        files = _.map(['lg', 'md', 'sm'], function(size) {
            return matches[1] + '_' + size + '.' + matches[2];
        });
    } else {
        files = [file];
    }
    
    files = _.map(files, function(file) {
        var port = req.app.get('port');
        var base = req.protocol + '://' + req.hostname + (port ? ':' + port : '');
        var url = path.join(req.file.baseUrl, file).replace(/[\\\/]+/g, '/').replace(/^[\/]+/g, '');
        
        return (req.file.storage == 'local' ? base : '') + '/' + url;
    });
    if(files)  {
        return res.json({
            images: files,
            imageID: imageID,
            pass: "pass"
        });
    } else {
        return res.json({
            pass: "fail"
        });
    }
    
    
});

export default router;

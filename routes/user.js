import { UserController } from '../controllers';
import express from 'express';

import { check, validationResult} from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validateMobileNumber, validateOTP } from '../utilities/checkers';
import config from '../config/index';
import { verifyJWT_MW } from '../middlewares/auth-middleware';
import { generateOTP } from '../utilities/otps';
import Users from '../models/user';
import UserProfile from '../models/userProfile';
let router = express.Router();

router.post(
  "/login",
  async (req, res) => {
    const {
      phoneNumber,
    } = req.body;
    if(validateMobileNumber(phoneNumber)) {
      const OTP = generateOTP(config.OTP_DIGIT_LENGTH);
      try {
        let user = await Users.findOne({ phoneNumber });
        if (user) {
            let updatedUser = await Users.updateOne(
                {"phoneNumber": phoneNumber},
                { $set: {"OTP": OTP}}
            );
            return res.status(200).json({
                status: "pass",
                phoneNumber: user.phoneNumber,
                otp: OTP
            });
        } else {
          user = new Users({ phoneNumber, OTP });
          await user.save();
          return res.status(200).json({
            status: "pass",
            phoneNumber: user.phoneNumber,
            otp: OTP
          });
        }
    } catch (err) {
        res.status(500).send("Error in Saving");
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
                                    phoneNumber: user.phoneNumber
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
            const {expertise, name, dob, sex, location, maritialStatus, education, experience, phoneNumber} = req.body.profile;
            console.log("phonenumber", phoneNumber)
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
            let errorListTemp = [];
            
            if(!name || name === "") {
                errorListTemp.push(name);
            }
            if(!dob.month || dob.month === "") {
                errorListTemp.push(dob.month);
            }
            if(!dob.day || dob.day === "") {
                errorListTemp.push(dob.day);
            }
            if(!dob.year || dob.year === "") {
                errorListTemp.push(dob.year);
            }
            if(!sex || sex === "") {
                errorListTemp.push(sex);
            }
            if(!maritialStatus || maritialStatus === "") {
                errorListTemp.push(maritialStatus);
            }
            if(!education || education === "" || education === "-1") {
                errorListTemp.push(education);
            }
            if(!experience || experience === "" || experience === "-1") {
                errorListTemp.push(experience);
            }
            
            if(!location.state || location.state === "") {
                errorListTemp.push(location.state);
            }
            if(!location.city || location.city === "") {
                errorListTemp.push(location.city);
            }
            if(errorListTemp.length > 0) {
                return res.json({
                    state: errorListTemp
                }).status(400);
            } else {
                if(errorListTemp.length === 0) {
                    let userProfle = new UserProfile({
                        name, 
                        month: dob.month,
                        year: dob.year,
                        day: dob.day,
                        sex,
                        maritialStatus,
                        education,
                        experience,
                        state: location.state,
                        city: location.city,
                        phoneNumber: phoneNumber,
                        expertise: expertise

                    });
                    await userProfle.save();
                    await Users.updateOne(
                        {"phoneNumber": phoneNumber},
                        { $set: {registered: true}}
                    );
                    return res.status(200).send({ name, dob, sex, location, maritialStatus, education, experience});
                }
            }
        } catch (err) {
            console.log(err.message);
            res.status(500).send("Something went wrong");
        }
    }
);

router.get(
    "/c/get-me",
    async (req, res, next) => {
        await verifyJWT_MW(req, res, next);
    },
    async (req, res) => {
        try {
            return res.send({
                "token": "token"
            })
        } catch (err) {
            console.log(err.message);
            res.status(500).send({err: err});
        }
    }
);

export default router;

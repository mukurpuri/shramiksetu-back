import { UserController } from '../controllers';
import express from 'express';

import { check, validationResult} from "express-validator";
import { validateMobileNumber, validateOTP } from '../utilities/checkers';
import Config from '../config/index';
import { generateOTP } from '../utilities/otps';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Users from '../models/user';
let router = express.Router();

router.post(
  "/login",
  async (req, res) => {
    const {
      phoneNumber,
    } = req.body;
    if(validateMobileNumber(phoneNumber)) {
      const OTP = generateOTP(Config.OTP_DIGIT_LENGTH);
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
                            "randomString", {
                                expiresIn: 10000
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
            res.status(500).send("Submit went wrong");
        }
    }
);


  //sendOTPToNumber(phoneNumber, OTP);
          //
          

export default router;

import { UserController } from '../controllers';
import express from 'express';

import { check, validationResult} from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validateMobileNumber, validateOTP } from '../utilities/checkers';
import config from '../config/index';
import { verifyJWT_MW } from '../middlewares/auth-middleware';
import { generateOTP, sendOTP } from '../utilities/otps';
import Company from '../models/company';
import Users from '../models/user';
import UserProfile from '../models/userProfile';
let router = express.Router();


  
router.post(
  "/register",
  async (req, res) => {
    const {
      data,
    } = req.body;
    if(data) {
      try {
        let company = new Company(data);
        await company.save();
        await Users.updateOne(
          {"phoneNumber": data.phoneNumber},
          { $set: {registered: true, name: data.name, type: 'Company'}}
        );
        return res.status(200).json({
          name: data.name,
          result: "pass",
          isRegistered: true
        });
    } catch (err) {
        return res.status(500).send("Error in Saving");
    }
    } else {
      return res.status(400).json({
        message: "Error"
      });
    }
  }
)

export default router;

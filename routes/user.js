// import dotenvJSON from "dotenv-json";
// dotenvJSON({
//     path: "../.env.json"
// });

import { UserController } from '../controllers';
import express from 'express';
import axios from "axios";
import { check, validationResult} from "express-validator";
import bcrypt from "bcryptjs";
import crypto from 'crypto';
import jwt from "jsonwebtoken";
import { validateMobileNumber, validateOTP, isValidState } from '../utilities/checkers';
import config from '../config/index';
import { verifyJWT_MW } from '../middlewares/auth-middleware';
import { generateOTP, sendOTP } from '../utilities/otps';
import { GetRJCovidCases } from '../utilities/APIs';
import Users from '../models/user';
import UserProfile from '../models/userProfile';
import Connections from '../models/connections';

import _ from 'lodash';
import path from 'path';
import multer from 'multer';
import AvatarStorage from '../helpers/AvatarStorage';
import { Connection } from 'mongoose';

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
      let OTP = generateOTP(config.OTP_DIGIT_LENGTH);
      //let OTPStatus = await sendOTP(config.TwoFactorAPI, phoneNumber, OTP);
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
                                    name: user.name || "",
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
            const {name, sex, location, phoneNumber} = req.body.profile;
            console.log("phonenumber", req.body.profile)
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
                location,
                phoneNumber
            });
            await userProfle.save();
            await Users.updateOne(
                {"phoneNumber": phoneNumber},
                { $set: {registered: true, name: name}}
            );
            return res.status(200).send({ name,
                name,
                location,
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
        var allowedMimes = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/gif'];
        if (_.includes(allowedMimes, file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only jpg, png and gif image files are allowed.'));
        }
    }
});
router.post('/upload-profile-picture', upload.single("avatar"), function(req, res, next) {
    var files;
    var file = req.file.filename;
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
        console.log(files)
        return res.json({
            images: files,
            imageID: imageID,
            result: "pass"
        });
    } else {
        return res.json({
            pass: "fail"
        });
    }
});
router.post(
    "/save-user-image",
    async (req, res) => {
        try {
            const { imageID, phoneNumber } = req.body;
            console.log(imageID, phoneNumber)
            if(phoneNumber && imageID) {
                try {
                  await Users.updateOne(
                    {"phoneNumber": phoneNumber},
                    { $set: {imageID: imageID}}
                  );
                  await UserProfile.updateOne(
                    {"phoneNumber": phoneNumber},
                    { $set: {imageID: imageID}}
                  );
                  return res.status(200).json({
                    result: "pass"
                  });
              } catch (err) {
                  console.log(err)
                  return res.status(500).send("Error in Saving");
              }
              } else {
                return res.status(400).json({
                  message: "Phone number or Image ID missing"
                });
              }
        } catch (err) {
            console.log(err.message);
            res.status(500).send("Something went wrong");
        }
    }
)

router.get(
    "/dashboard",
    async(req, res) => {
        const { phoneNumber, state, city } = req.query;
        if(phoneNumber && isValidState(state)) {
            const path = `https://api.covid19india.org/v3/min/data.min.json`;
            axios.get(path)
            .then(function (response) {
                let stateData = response.data[state];
                let cityData = stateData.districts[city];
                return res.json({
                    data: {
                        status: "pass",
                        tracker: {
                            corona: {
                                city: cityData,
                                state: {
                                    delta: stateData.delta || null,
                                    total: stateData.total || null
                                }
                            }
                        }
                    }
                })
            })
            .catch(function (error) {
                return "fail"
            })
            } else {
                return res.status(400).json({
                message: "Something went wrong"
                });
            }
    }
)
router.post("/create-connection",
    async(req, res) => {
        const { primary } = req.body;
        if(primary) {
            let  connection = new Connections({
                primary: primary,
                secondary: "4423433421"
            });
            await connection.save();
            res.json({
                status: "pass"
            })
        }
    }
);
router.get("/profile",
    async(req, res) => {
        const { phoneNumber } = req.query;
        if(phoneNumber) {
            let userprofile = await UserProfile.findOne({phoneNumber});
            let connections = await Connections.find(
                {
                    $or:[ {'primary':phoneNumber}, {'secondary':phoneNumber}],
                    $and: [{ 'accepted': true }]
                }
            )
            let connectionIDs = [];

            for (const connection of connections) {
                let id = "";
                if(connection.primary !== phoneNumber) {
                    id = connection.primary;
                }
                if(connection.secondary !== phoneNumber) {
                    id = connection.secondary;
                }
                let connector = await UserProfile.findOne({phoneNumber: id});
                connectionIDs.push({
                    name: connector.name.split(" ")[0],
                    imageID: connector.imageID,
                    phoneNumber: connector.phoneNumber
                })
              }

            return res.json({
                data: {
                    status: "pass",
                    body: {
                        name: userprofile.name,
                        about: userprofile.about,
                        liked: userprofile.liked,
                        problemSolver: userprofile.problemSolver,
                        enviromentHelper: userprofile.enviromentHelper,
                        connections: connectionIDs
                    }
                }
            })
            } else {
                return res.status(400).json({
                message: "Phone number missing"
                });
            }
        return res.json({
            data: {
                phoneNumber
            }
        })
    }
)

export default router;

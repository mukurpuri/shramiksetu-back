// import dotenvJSON from "dotenv-json";
// dotenvJSON({
//     path: "../.env.json"
// });

import { UserController } from '../controllers';
import express from 'express';
import moment from 'moment';
import axios from "axios";
import jwt from "jsonwebtoken";
import { validateMobileNumber, validateOTP, isValidState } from '../utilities/checkers';
import config from '../config/index';
import { verifyJWT_MW } from '../middlewares/auth-middleware';
import { generateOTP, sendOTP } from '../utilities/otps';
import Users from '../models/user';

import Hide from '../models/hide';
import Block from '../models/block';
import Mute from '../models/mute';
import Report from '../models/report';

import Save from '../models/save';
import Answers from '../models/answer';
import Questions from '../models/question';
import UserProfile from '../models/userProfile';
import Connections from '../models/connections';
import Notification from '../models/notificaton';
import Messages from '../models/message';
import Shop from '../models/shop'
import ShopCategories from '../models/shopCategories'
import _ from 'lodash';
import path from 'path';
import multer from 'multer';
import AvatarStorage from '../helpers/AvatarStorage';
import { CalculateDistanceBetweenTwoPointsRaw } from '../utilities/maps';
import NodeGeocoder from 'node-geocoder';
import save from '../models/save';
import user from '../models/user';
import items from '../models/items';
import Banner from '../models/banner';
import HideBanner from '../models/bannerHidden';

import { TimeFormats } from '../utilities/time';
import Conversations from '../models/conversation';
import MessageInteraction from '../models/messageInteraction';

const options = {
    provider: 'google',
    apiKey: config.GOOGLE_GEOCODE_API,
};
const geocoder = NodeGeocoder(options);
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
    //   let OTPStatus = "";
    //   if(!_.includes(config.SPECIAL_ACCCOUNTS)) {
    //     OTPStatus = await sendOTP(config.TwoFactorAPI, phoneNumber, OTP);
    //   }
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
                                    imageID: user.imageID || "",
                                    isVerified: user.isVerified || false,
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
            const {name, sex, location, id} = req.body.profile
            if(!id) {
                return res.status(500).json({
                    "status": "fail",
                    "error": "id not provided"
                });
            }
            let userRegistered = await UserProfile.findOne({ userId: id });
            if(userRegistered) {
                return res.status(500).json({
                    "status": "fail",
                    "error": "User already registered"
                });
            }
            let userProfle = await new UserProfile({
                name,
                sex,
                location,
                about: "",
                userId: id
            });
            await userProfle.save();
            await Users.updateOne(
                {"_id": id},
                { $set: {registered: true, name: name}}
            );

            return res.status(200).send({
                name,
                }); 

        } catch (err) {
            console.log(err);
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
            const { imageID, id } = req.body;
            if(id && imageID) {
                try {
                  await Users.updateOne(
                    {"_id": id},
                    { $set: {imageID: imageID}}
                  );
                  await UserProfile.updateOne(
                    {"userId": id},
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
        const { id, state, city, expoPushToken } = req.query;
        if(id && isValidState(state)) {

            let user = await Users.updateOne({_id: id}, {$set: {
                uid: expoPushToken
            }});

            const path = `https://api.covid19india.org/v3/min/data.min.json`;
            let topQuestions = [];
            let questions = await Questions.find().limit(5);
            for(const question of questions) {
                let user = await Users.findById(question.createdBy);
                let askedOn  = parseInt(question.createdAt);
                
                let answers = await Answers.find(
                    { questionId: question.id },
                );
                let selectedAnswer = _.maxBy(answers, function(answer) { return answer.votes; });
                topQuestions.push(
                    {
                        id: question.id,
                        askedOn: moment(askedOn).fromNow(),
                        question: question.title,
                        primaryAnswer: selectedAnswer ? selectedAnswer.text : "",
                        asker: {
                           name: user.name,
                           id: user.id,
                           imageId: user.imageID
                        },
                        answers: answers.length
                    }
                )
            }

            

            axios.get(path)
            .then(function (response) {
                let stateData = response.data[state];
                let cityData = stateData.districts[city];
                return res.json({
                    data: {
                        status: "pass",
                        qas: topQuestions,
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
        const { id } = req.query;
        if(id) {
            let userprofile = await UserProfile.findOne({userId: id});
            let user =  await Users.findOne({_id: id});
            // let connections = await Connections.find(
            //     {
            //         $or:[ {'primary':phoneNumber}, {'secondary':phoneNumber}],
            //         $and: [{ 'accepted': true }]
            //     }
            // )
            let connectionIDs = [];

            // for (const connection of connections) {
            //     let id = "";
            //     if(connection.primary !== phoneNumber) {
            //         id = connection.primary;
            //     }
            //     if(connection.secondary !== phoneNumber) {
            //         id = connection.secondary;
            //     }
            //     let connector = await UserProfile.findOne({phoneNumber: id});
            //     connectionIDs.push({
            //         name: connector.name.split(" ")[0],
            //         imageID: connector.imageID,
            //         phoneNumber: connector.phoneNumber
            //     })
            //   }
            if(userprofile) {
                return res.json({
                    data: {
                        status: "pass",
                        body: {
                            name: userprofile.name,
                            about: userprofile.about,
                            isVerified: user.isVerified
                        }
                    }
                })
            } else {
                return res.status(400).json({
                    message: "Profile not found"
                });
            }
            } else {
                return res.status(400).json({
                message: "Id missing"
                });
            }
        return res.json({
            data: {
                phoneNumber
            }
        })
    }
)

router.get("/notifications",
    async(req, res) => {
        const { userId } = req.query;
        if(userId) {
            let notifications = [];
            let notificationQuery = await Notification.find({ userId, engagementBy: { $ne: userId } }).limit(10);
            await Notification.updateMany({ userId },{ $set: { isRead: true }});
            for(const notification of notificationQuery) {
                let engagerID = notification.engagementBy;
                let user  = await Users.findOne({ _id: engagerID });
                let textNode = "";
                switch(notification.type) {
                    case 1:
                      textNode = `<Text style={LocalStyles.text}><Text style={Styles.typograhy.linkText}>` + user.name + `</Text> gave an answer to your Question <Text style={Styles.typograhy.strong}>`+ title +`</Text></Text>`
                      break;
                    case 2:
                      textNode = `<Text style={LocalStyles.text}><Text style={Styles.typograhy.linkText}>` + user.name + `</Text> upvoted your Question <Text style={Styles.typograhy.strong}>`+ title +`</Text></Text>`
                    case 3:
                      textNode = `<Text style={LocalStyles.text}><Text style={Styles.typograhy.linkText}>` + user.name + `</Text> upvoted your Answer <Text style={Styles.typograhy.strong}>`+ title +`</Text></Text>`
                      break;

                      case 4:
                      textNode = user.name + ` has added you in their "Saved" List`

                      case 5:
                      textNode = user.name + ` has been added in your "Saved" List`
                  }

                notifications.push({
                    createdOn:  moment(parseInt(notification.createdAt)).fromNow(),
                    imageID: user.imageID,
                    postId: notification.postId,
                    textNode,
                    id: notification._id
                });
            }
            return res.status(200).json({
                notifications
            })
        }
    }
)

router.get("/getUpdates", async(req, res) => {
    const { userId } = req.query;
    if(userId) {
        let messages = await Messages.find({
            "secondary": userId, "isRead": false 
        });

        let saves = await Save.find({
            "entityId": userId, "accepted": false, "isRequested": true
        });

        let notifications = await Notification.find({
            userId, "isRead": false, engagementBy: { $ne: userId }
        });

        let requests = {
            messages: messages.length,
            notifications: notifications.length,
            saves: saves.length
        }
        return res.status(200).json({
            requests
        });
    }
});

router.get("/getProfile", async(req, res) => {
    const { id } = req.query;
    if(id) {
        let  userProfile = await UserProfile.findOne({userId: id});

        let requests = {
            name: userProfile.name,
            about: userProfile.about
        }
        return res.status(200).json({
            requests
        });
    } else {
        res.status(500).json({
            "result": 'fail'
        })
    }
});

router.post("/submit-edited-profile",
    async(req, res) => {
        const { name, about, id } = req.body;
        if(name && id) {
            let userProfile  = await UserProfile.updateOne({ userId: id }, { $set: { name, about }});
            let user = await Users.updateOne({ _id: id }, { $set: { name }});
            return res.status(200).json({
                name: name
            })
        }
    }
);

router.post("/kill-notification",
    async(req, res) => {
        const { id } = req.body;
        if(id) {
            await Notification.deleteOne({
                _id: id
            });
            return res.status(200).json({
                "result": "deleted"
            })
        }
    }
);

router.post("/get-address-from-coordinates", async(req, res) => {
    const { lat, lng } = req.body;
    const response = await geocoder.reverse({ lat: lat, lon: lng });
    return res.status(200).json({
        address: response[0].formattedAddress,
        lat: response[0].latitude,
        lng: response[0].longitude
    });
});

router.post("/save-node", async(req, res) => {
    const { entityId, type, userId  } = req.body;
    try {
        let isAlreadySaved = await Save.findOne({ entityId, type, userId });
        if(!isAlreadySaved) {
            let enitityToSave = new Save({ entityId, type, userId, accepted: true });
            await enitityToSave.save();
            return res.status(200).json({
                status: "saved",
                enitityToSave
            });
        } else {
            return res.status(200).json({
                status: "already savedd",
            });
        }
    } catch(err) {
        return res.status(500).send(err);
    }

});

router.post("/delete-node", async(req, res) => {
    const { entityId, userId  } = req.body;
    try {
        await Save.deleteOne({ entityId, userId });
        return res.status(200).json({
            status: "removed",
        });
    } catch(err) {
        console.log(err);
        return res.status(500).send(err);
    }
});

router.get("/get-acccounts", async(req, res) => {
    if(req.query[0]) {
        let  Shops = await Shop.find({createdBy: req.query[0]});
        let User = await Users.findOne({ _id:req.query[0] });
        let businesses = [];
        let myAccount = {
            name: User.name,
            imageID: User.imageID,
        }
        _.each(Shops, shop => {
            businesses.push({
                name: shop.name,
                imageID: shop.imageID,
                about: shop.about,
                id: shop._id,
                hide: shop.hide,
                deactivate: shop.deactivate
            })
        })
        return res.status(200).json({
            businesses,
            myAccount
        });
    } else {
        res.status(500).json({
            "result": 'fail'
        })
    }
});

router.post("/connect/people", async(req, res) => {
    const { range, lat, lng, id } = req.body.data;

    const people = await Users.find({ _id: { $nin: id } });


    let PeopleList = [];
    for(const person of people) {
        
        // let isPrivate = person.isPrivate;

        // let isSaved = await Save.findOne({
        //     $or: [
        //         {
        //             entityId: person._id,
        //             userId: id
        //         },
        //         {
        //             entityId: id,
        //             userId: person._id
        //         }
        //     ]
        // });

        // if(isSaved) {
        //     if(isSaved.accepted === true) {
        //         isPrivate = false
        //     } else {
        //         isPrivate = true
        //     }
        // }
        
        const hidden = await Hide.findOne({
            entityId: person._id,
            createdBy: id
        });

        const blocked = await Block.findOne({
            entityId: person._id,
            createdBy: id
        });
        
        if(!hidden && !blocked) {
            let nearbyRange = CalculateDistanceBetweenTwoPointsRaw({lat, lng}, {lat: person.lat, lng: person.lng});
            if(nearbyRange <= parseInt(range)) {
                PeopleList.push(
                    {
                        id: person.id,
                        name: person.name,
                        imageID: person.imageID,
                        hasStatus: false,
                        locx: nearbyRange,
                        isVerified: person.isVerified,
                        uid: person.uid,
                        //isRequested: isSaved ? isSaved.isRequested : false
                    }
                )
            }
        }
    }


    try {
        return res.status(200).json({
            data: PeopleList,
            range,
            lat: lat,
            lng: lng,
            result: "pass"
        });

    } catch(err) {
        console.log(err);
        return res.status(500).send(err);
    }
});

router.post("/connect/shops", async(req, res) => {
    const { range, lat, lng, id } = req.body.data;
    try {
        const Shops = await Shop.find({ createdBy: { $nin: id } });
        const User = await Users.findOne({ _id: id});
        let ShopList = [];
        if(Shops.length) {
            for(const Shop of Shops) {

                let isPrivate = Shop.isPrivate;

                let isSaved = await Save.findOne({
                    entityId: Shop._id,
                    userId: id,
                    accepted: true
                });
                
                if(isSaved) {
                    if(isSaved.accepted === true) {
                        isPrivate = false
                    } else {
                        isPrivate = true
                    }
                }

                const hidden = await Hide.findOne({
                    entityId: Shop._id,
                    createdBy: id
                });
        
                const blocked = await Block.findOne({
                    entityId: Shop._id,
                    createdBy: id
                });

                if(!hidden && !blocked) {
                    let nearbyRange = CalculateDistanceBetweenTwoPointsRaw({lat, lng}, {lat: Shop.lat, lng: Shop.lng});
                    if(nearbyRange <= parseInt(range)) {
                        const Owner = await Users.findOne({ _id: Shop.createdBy});
                        
                        let shopBanner = await Banner.findOne({
                            shopId: Shop._id,
                            active: true
                        });

                        let isHiddenToUser = await HideBanner.findOne({
                            shopId: Shop.id,
                            userId: id
                        });
                        ShopList.push(
                            {
                                id: Shop.id,
                                name: Shop.name,
                                imageID: Shop.imageID,
                                stars: Shop.stars,
                                isVerified: Shop.isVerified,
                                ownerId: Shop.createdBy,
                                distance: nearbyRange < 1000 ?  nearbyRange + " Meters" : "1 Km",
                                categories: Shop.category.join(",").replace(",", ", "),
                                isPrivate,
                                uid: Owner.uid,
                                banner: shopBanner,
                                isRequested: isSaved ? isSaved.isRequested : false,
                                isBannerActive:  isHiddenToUser ? isHiddenToUser.active : true
                            }
                        )
                    }
                }
            }
        }

        return res.status(200).json({
            data: ShopList,
            range,
            lat: lat,
            lng: lng,
            result: "pass"
        });

    } catch(err) {
        console.log(err);
        return res.status(500).send(err);
    }
});

router.post("/set-location", async(req, res) => {
    try {
        const people = await Users.updateOne({ _id: req.body.data.location.userID }, { $set: {"lat": req.body.data.location.lat, "lng": req.body.data.location.lng }});
        return res.status(200).json({
            result: "updated"
        });

    } catch(err) {
        console.log(err);
        return res.status(500).send(err);
    }
});

router.post("/getAllAccounts", async(req, res) => {
    const { id } = req.body;
    try {
        const shops = await Shop.find({ createdBy: id});
        const user = await Users.findOne({_id: id});
        let data = [];
        data.push({
            id: user._id,
            name: user.name,
            imageID: user.imageID
        });
        for(const shop of shops) {
            data.push({
                id: shop._id,
                name: shop.name,
                imageID: shop.imageID
            })
        }
        return res.status(200).json({
            data,
            result: "pass"
        });

    } catch(err) {
        console.log(err);
        return res.status(500).send(err);
    }
});

router.post("/save-to-list", async(req, res) => {
    const { entityId, type, userId } = req.body.data;
    try {
        let isSaved = await Save.findOne({
            entityId, type, userId
        });
        if(!isSaved) {
            let newSave = new Save({
                entityId, type, userId, accepted: true
            });
            await newSave.save();

            let newNotification = new Notification({
                type: 4,
                userId: entityId,
                engagementBy: userId,
            })

            await newNotification.save()
            res.status(200).json({
                "result": "saved"
            });
        } else {
            res.status(200).json({
                "result": "Already saved"
            })
        }
    } catch(err) {
        console.log(err);
        return res.status(500).send(err);
    }
});

router.post("/set-save-request", async(req, res) => {
    const { entityId, type, userId, isRequested, message } = req.body.data;
    try {
        const saved = await Save.findOne({
            entityId, type, userId
        });
        if(saved) {
            await Save.updateOne({ entityId, type, userId }, { $set: { isRequested: isRequested }})
        } else {
            let newSave = new Save({
                entityId, type, userId, isRequested, message
            });
            await newSave.save();
        }

        res.status(200).json({
            "result": "requested save",
            "isRequested": isRequested
        })
    } catch(err) {
        console.log(err);
        return res.status(500).send(err);
    }
})

router.post("/get-save-info", async(req, res) => {
    const { entityId, type, userId } = req.body;
    try {
        let newSave = await Save.findOne({
            entityId, type, userId
        });
        res.status(200).json({
            "isSaved": newSave ? true : false
        })
    } catch(err) {
        console.log(err);
        return res.status(500).send(err);
    }
})

router.post("/hide", async(req, res) => {
    const { entityId, createdBy, type } = req.body;
    try {
        let newHide = new Hide({
            entityId, createdBy, type
        });
        await newHide.save();
        res.status(200).json({
            "result": "hidded"
        })
    } catch(err) {
        console.log(err);
        return res.status(500).send(err);
    }
})

router.post("/unHide", async(req, res) => {
    const { id } = req.body;
    try {
        let unHide = await Hide.deleteOne({
            _id: id
        })
        res.status(200).json({
            "result": "unhidden"
        })
    } catch(err) {
        console.log(err);
        return res.status(500).send(err);
    }
})

router.post("/block", async(req, res) => {
    const { entityId, createdBy, type } = req.body;
    try {
        let newBlock = new Block({
            entityId, createdBy, type
        });
        await newBlock.save();
        res.status(200).json({
            "result": "blocked"
        })
    } catch(err) {
        console.log(err);
        return res.status(500).send(err);
    }
})

router.post("/unBlock", async(req, res) => {
    const { id } = req.body;
    try {
        let unBlock = await Block.deleteOne({
            _id: id
        })
        res.status(200).json({
            "result": "unblocked"
        })
    } catch(err) {
        console.log(err);
        return res.status(500).send(err);
    }
})


router.post("/mute", async(req, res) => {
    const { entityId, createdBy, type } = req.body;
    try {
        let newMute = new Mute({
            entityId, createdBy, type
        });
        await newMute.save();
        res.status(200).json({
            "result": "muted"
        })
    } catch(err) {
        console.log(err);
        return res.status(500).send(err);
    }
})

router.post("/report", async(req, res) => {
    const { entityId, createdBy, message } = req.body;
    try {
        let newReport = new Report({
            entityId, createdBy, type: 0, message
        });
        await newReport.save();
        res.status(200).json({
            "result": "reported"
        })
    } catch(err) {
        console.log(err);
        return res.status(500).send(err);
    }
})


router.post("/unMute", async(req, res) => {
    const { entityId, createdBy } = req.body;
    try {
        let unMute = await Mute.deleteOne({
            entityId, createdBy, type: 0
        })
        unMute.save();
        res.status(200).json({
            "result": "unmute"
        })
    } catch(err) {
        console.log(err);
        return res.status(500).send(err);
    }
})


router.post("/myList", async(req, res) => {
    const { id } = req.body;
    try {
        let hiddenList = [];
        let hiddenListLength = 0;
        const hiddenArray = await Hide.find({
            createdBy: id
        });
        hiddenListLength = hiddenArray.length;
        for(const hidenItem of hiddenArray) {
            let person = await Users.findOne({_id: hidenItem.entityId});
            if(person) {
                hiddenList.push({
                    id: hidenItem._id,
                    name: person.name,
                    imageID: person.imageID,
                    createdAt: moment(parseInt(hidenItem.createdAt)).fromNow()
                })
            }

            let shop = await Shop.findOne({_id: hidenItem.entityId});
            if(shop) {
                hiddenList.push({
                    id: hidenItem._id,
                    name: shop.name,
                    imageID: shop.imageID,
                    createdAt: moment(parseInt(hidenItem.createdAt)).fromNow()
                })
            }
        }



        let MutedList = [];
        let MutedListLength = 0;
        const MutedArray = await Mute.find({
            createdBy: id
        });
        MutedListLength = MutedArray.length;
        for(const MuteItem of MutedArray) {
            let person = await Users.findOne({_id: MuteItem.entityId});
            if(person) {
                MutedList.push({
                    id: person._id,
                    name: person.name,
                    imageID: person.imageID,
                    createdAt: moment(parseInt(person.createdAt)).fromNow()
                })
            }

            let shop = await Shop.findOne({_id: MuteItem.entityId});
            if(shop) {
                MutedList.push({
                    id: shop._id,
                    name: shop.name,
                    imageID: shop.imageID,
                    createdAt: moment(parseInt(MuteItem.createdAt)).fromNow()
                })
            }
        }

        let BlockedList = [];
        let BlockedListLength = 0;
        const BlockedArray = await Block.find({
            createdBy: id
        });
        
        BlockedListLength = BlockedArray.length;
        for(const BlockItem of BlockedArray) {
            let person = await Users.findOne({_id: BlockItem.entityId});
            if(person) {
                BlockedList.push({
                    id: BlockItem._id,
                    name: person.name,
                    imageID: person.imageID,
                    createdAt: moment(parseInt(BlockItem.createdAt)).fromNow()
                })
            }

            let shop = await Shop.findOne({_id: BlockItem.entityId});
            if(shop) {
                BlockedList.push({
                    id: BlockItem._id,
                    name: shop.name,
                    imageID: shop.imageID,
                    createdAt: moment(parseInt(BlockItem.createdAt)).fromNow()
                })
            }
        }

        let list = {
            hidden: {
                numbers: hiddenListLength,
                list: hiddenList
            },
            mute: {
              numbers: MutedListLength,
              list: MutedList
            },
            blocked: {
                numbers: BlockedListLength,
                list: BlockedList
            }
        }
        
        res.status(200).json({
            "result": "done",
            data: list
        })
    } catch(err) {
        console.log(err);
        return res.status(500).send(err);
    }
})

router.post("/mySave", async(req, res) => {
    const { id } = req.body;
    try {
        let saves = await Save.find({
            userId: id,
            accepted: true
        });
        let data = {
            people: [],
            shops: []
        }
        let peopleList = [];
        let shopList = [];

        for(const save of saves) {
            let type = save.type;
            switch(type) {
                case 0:
                    let people = await Users.find({_id: save.entityId});
                    for(const person of people) {
                        peopleList.push({
                            saveID: save._id,
                            id: person._id,
                            name: person.name,
                            imageID: person.imageID,
                            isVerified: person.isVerified,
                        })
                    }
                break;

                case 1:
                    let shops = await Shop.find({_id: save.entityId});
                    for(const shop of shops) {
                        shopList.push({
                            saveID: save._id,
                            id: shop._id,
                            name: shop.name,
                            imageID: shop.imageID,
                            isVerified: shop.isVerified,
                        })
                    }
                break;

                default:
                console.log("Unkown types");
            }
        }
        data.people = peopleList;
        data.shops = shopList;

        res.status(200).json({
            data: data,
            "result": "saves"
        })
    } catch(err) {
        console.log(err);
        return res.status(500).send(err);
    }
});


router.post("/remove-save", async(req, res) => {
    const { id } = req.body;
    try {
        let saves = await Save.deleteOne({
            _id: id
        });
        return res.status(200).json({
            result: "removed"
        })
    } catch(err) {
        console.log(err);
        return res.status(500).send(err);
    }
});

router.post("/allow-save", async(req, res) => {
    const { id } = req.body;
    try {
        let UpdateSave = await Save.updateOne(
            {_id: id},
            { $set: {"isRequested": false, "accepted": true}}
        );
        let save = await Save.findOne({ _id: id});

        let newNotification = new Notification({
            type: 5,
            userId: save.userId,
            engagementBy: save.entityId,
        })

        await newNotification.save()

        return res.status(200).json({
            result: "saved"
        })
    } catch(err) {
        console.log(err);
        return res.status(500).send(err);
    }
});


router.post("/messages", async(req, res) => {
    const { id } = req.body;
    try {
        let data = {
            messages: [],
            requests: []
        }
        //console.log("AA")
        // return res.status(200).json({
        //     data,
        //     result: "messaged"
        // })
        
        let saves = await Save.find({
            entityId: id,
            accepted: false,
            isRequested: true
        });

        for(const save of saves) {
            const person = await Users.findOne({_id: save.userId});
            data.requests.push({
                id: save._id,
                name: person.name,
                uid: person.uid,
                imageID: person.imageID,
                message: save.message,
                createdAt: moment(parseInt(save.createdAt)).fromNow(),
                doneAccept: false
            })
        }

        let interactions = await MessageInteraction.findOne({
            userId: id
        });

        let messageSet = [];
        let participants = interactions.with;
        for(const participant of participants) {
            let conversation = await Conversations.find({
                $or: [{sender: participant}, {receiver: participant}]
            }).limit(1).sort({'_id':-1});
            

            let recepient = conversation[0].sender.toString() === id.toString() ? recepient = conversation[0].receiver : conversation[0].sender;
            let userSet = null;
            let type = "0";
            let user = await Users.findOne({
                _id: recepient
            });

            if(!user) {
                type = "1";
                user = await Shop.findOne({
                    _id: recepient
                });
            }

            if(type === "0") {
                userSet = {
                    id: recepient,
                    name: user.name,
                    imageID: user.imageID,
                    hasStatus: false,
                    isVerified: user.isVerified,
                    uid: user.uid,
                };
            }

            if(type === "1") {
                let shopBanner = await Banner.findOne({
                    shopId: recepient,
                    active: true
                });

                let isHiddenToUser = await HideBanner.findOne({
                    shopId: recepient,
                    userId: id
                });
               userSet = {
                    id: recepient,
                    name: user.name,
                    imageID: user.imageID,
                    ownerId: user.createdBy,
                    hasStatus: false,
                    isVerified: user.isVerified,
                    uid: user.uid,
                    banner: shopBanner,
                    isBannerActive: isHiddenToUser ? isHiddenToUser.active : true
                }; 
            }


            data.messages.push({
                id: conversation[0]._id,
                message: conversation[0].text,
                user: userSet,
                media: conversation[0].media,
                type: conversation[0].type.toString(),
                createdAt: parseInt(conversation[0].createdAt),
                time: moment(parseInt(conversation[0].createdAt)).fromNow(),
                isSentOrNot: conversation[0].sender.toString() === id.toString()
            });
        }

        data.messages = _.orderBy(data.messages, ['createdAt'], ['dsc']);

        return res.status(200).json({
            data,
            result: "messaged"
        })
    } catch(err) {
        console.log(err);
        return res.status(500).send(err);
    }
});

router.post("/add-items", async(req, res) => {
    const { shopId, imageId, name, subTitle, description } = req.body.data;
    try {
        let newItem = new Items({
            entityId, type, userId, accepted: true
        });
        await newItem.save();
        
        res.status(200).json({
            "result": "saved"
        });
    } catch(err) {
        console.log(err);
        return res.status(500).send(err);
    }
});


router.post("/create-message", async(req, res) => {
    const { 
        message,
        sender,
        receiver } = req.body.data;
    try {
        
        // let senderUser = await Users.findOne({_id: sender});
        // console.log("senderUser", senderUser);
        // let isSaved = await Save.findOne({
        //     userId: sender,
        //     entityId: receiver,
        //     accepted: true,
        // });

        // if(!senderUser.isPrivate && !isSaved) {
        //     return res.status(500).json({
        //         "result": "fail"
        //     });
        // } else {
        //     let newSave = new Save({
        //         entityId: sender , type: 0, userId: receiver, accepted: true
        //     });
        //     await newSave.save();
        // }
        
        let newConversation = new Conversations({
            sender,
            receiver,
            type: message.type,
            text: message.text,
            media: message.type === 0 ? null : message.media,
            createdAt: Date.parse(new Date())
        });
        await newConversation.save();

        let participants = [];
        participants.push(sender);
        participants.push(receiver);
        let newMessage = new Messages({
            participants, conversationID: newConversation._id
        });
        await newMessage.save();

        let newInteraction = await MessageInteraction.updateOne(
            { userId: sender  },
            { $addToSet: { with: receiver } },
            { upsert: true }
        )
        
        res.status(200).json({
            "result": "saved message"
        });
    } catch(err) {
        console.log(err);
        return res.status(500).send(err);
    }
});

router.post('/get-latest-message', async(req, res) => {
    const { 
        primary,
        secondary
    } = req.body.data;
    try {
        let LatestConversation = await Conversations.findOne({
            sender: secondary, receiver: primary
        }).sort({'_id':-1});
        if(LatestConversation) {
            res.status(200).json({
                message: {
                    id: LatestConversation._id,
                    time: moment(parseInt(LatestConversation.createdAt)).format(TimeFormats(0)),
                    message: LatestConversation.text,
                    isOther: true,
                    status: "sent",
                    type: LatestConversation.type,
                    media: LatestConversation.type === 2 ?  LatestConversation.media : null,
                },
                "result": "latest"
            });
        } else {
            res.status(200).json({
                message: {
                },
                "result": "latest"
            });
        }
        
    } catch(err) {
        console.log(err);
        return res.status(500).send(err);
    }
})

router.post("/seen-message", async(req, res) => {
    const { 
        id
    } = req.body;
    try {
        let conversation = await Conversations.updateOne({_id: id}, { $set: { status:  "seen"} });
        res.status(200).json({
            "status": "messages"
        });
    } catch(err) {
        console.log(err);
        return res.status(500).send(err);
    }
});

router.post("/get-messages", async(req, res) => {
    const { 
        primary,
        secondary
    } = req.body.data;
    try {
        let messageSet = [];
        let messages = await Messages.find({
            participants: {$all : [primary, secondary]}
        });
        for(const message of messages) {
            let conversations = await Conversations.find({_id: message.conversationID});
            for(const conversation of conversations) {
                let sender = conversation.sender;
                let receiver = conversation.receiver;
                let type = conversation.type;
                let messageText = conversation.text;
                let media = conversation.media;
                let createdAt = moment(parseInt(conversation.createdAt)).format(TimeFormats(0));

                messageSet.push({
                    id: conversation._id,
                    isOther: sender.toString() === secondary.toString(),
                    time: createdAt,
                    type: conversation.type,
                    media: conversation.type === 2 ?  conversation.media : null,
                    message: messageText
                })
            }
        }
        res.status(200).json({
            messages: messageSet,
            "result": "messages"
        });
    } catch(err) {
        console.log(err);
        return res.status(500).send(err);
    }
});


router.post('/upload-image', upload.single("avatar"), function(req, res, next) {
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

export default router;

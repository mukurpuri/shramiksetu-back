
import express from 'express';
import moment from 'moment';
import _ from 'lodash';
import ShopCategories from '../models/shopCategories';
import Shop from '../models/shop';
import User from '../models/user';
import Save from '../models/save';

import Block from '../models/block';
import Report from '../models/report';
import Banner from '../models/banner';
import HideBanner from '../models/bannerHidden';

import Reviews from '../models/reviews';
let router = express.Router();
import { CalculateDistanceBetweenTwoPoints } from '../utilities/maps';
import { create } from 'jimp';

router.get(
  "/categories",
  async (req, res) => {
    try {
        let categories = await ShopCategories.find();
        return res.json({
            categories: categories
        });
    } catch (err) {
        return res.status(500).send(err);
    }
  }
)

router.post("/set-up-shop", async(req, res) => {
  const { data } = req.body;
  try {
    let newShop = new Shop({
      name: data.name,
      about: data.about,
      imageID: data.imageID,
      lat: data.lat,
      lng: data.lng,
      address: data.address,
      createdBy: data.userID,
      category: data.categories,
      hide: data.hide,
      deactivate: data.deactivate
    });
    await newShop.save();
    return res.json({
        result: "pass",
        name: data.name,
        imageID: data.imageID
    });
  } catch (err) {
    //console.log(err);
    return res.status(500).send(err);
  }
})

router.get("/get", async(req, res) => {
  const { id, location, userID } = req.query;
  try {
    if(id) {
      let shop = await Shop.findById(id);
      let range = CalculateDistanceBetweenTwoPoints(JSON.parse(location), {lat: shop.lat, lng: shop.lng});
      let reviews = await Reviews.find({ parentId: shop._id, type: 1 }).sort({createdAt:-1}) ;
      let allReviews = [];
      let totalStars = 0;
      if(reviews && reviews.length > 0) {
        for(const review of reviews) {
            let user = await User.findOne({id: review.createBy});
            totalStars += parseInt(review.stars);
            allReviews.push({
              id: review._id,
              text: review.text,
              stars: review.stars,
              createdAt: moment(parseInt(review.createdAt)).fromNow(),
              user: {
                imageID: user.imageID,
                name: user.name,
                id: user._id
              }
            });
        }
      }
      let averageStars = 0;
      if(allReviews.length > 0 && totalStars > 0) {
        averageStars = Math.round(totalStars/allReviews.length)
      }

      let isSaved = await Save.findOne({ entityId: id, type: 1, userId: userID });

      let shopData = {
        id: shop._id,
        name: shop.name,
        about: shop.about,
        imageID: shop.imageID,
        address: shop.address,
        stars: shop.stars,
        noOfReviews:  allReviews.length,
        reviews: allReviews,
        isVerified: shop.isVerified,
        category: shop.category,
        contacts: shop.contacts,
        averageStars: averageStars,
        isOwner: (shop.createdBy.toString() === userID.toString()),
        isSaved: isSaved !== null ? true : false,
        location: {
          lat: shop.lat,
          lng: shop.lng
        },
        range: range,
        hide: shop.hide,
        deactivate: shop.deactivate
      }

      return res.status(200).json({
        data: shopData
      });
    } else {
      return res.status(200).json({
        data: null
      });
    }
  } catch (err) {
    console.log(err)
    return res.status(500).send(err);
  }
})


router.post("/add-review", async(req, res) => {
  const { text, stars, userId, parentId, createdBy } = req.body;
  try {
    if(stars > 0) {
      let NewReview = new Reviews({
        text,
        stars,
        createdBy,
        type: 1,
        parentId
      });
      await NewReview.save();
      return res.status(200).json({
        data: NewReview
      });
    } else {
      return res.status(500).json({
        message: "Empty stars"
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

router.post("/hide-shop", async(req, res) => {
  const { userId, entityId, state } = req.body;
  try {
    if(entityId) {
      let updatedShop = await Shop.updateOne(
        { _id: entityId, createdBy: userId}, {$set: { hide: state }});

      return res.status(200).json({
        status: "hidden"
      });
    } else {
      return res.status(500).json({
        message: "Empty node"
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

router.post("/deactivate-shop", async(req, res) => {
  const { userId, entityId, state } = req.body;
  try {
    if(entityId) {
      
      await Shop.updateOne(
        { _id: entityId, createdBy: userId}, {$set: { deactivate: state }});

      return res.status(200).json({
        status: "deactivated"
      });
    } else {
      return res.status(500).json({
        message: "Empty node"
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

router.post("/delete-shop", async(req, res) => {
  const { userId, entityId, state } = req.body;
  try {
    if(entityId) {
      await Shop.deleteOne({ _id: entityId, createdBy: userId});
      return res.status(200).json({
        status: "delete"
      });
    } else {
      return res.status(500).json({
        message: "Empty node"
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});


router.post("/block", async(req, res) => {
  const { createdBy, entityId } = req.body.data;
  try {
    if(entityId && createdBy) {
      let blockShop = new Block({
        entityId,
        createdBy,
        type: 1
      });
      await blockShop.save();
      return res.status(200).json({
        status: "blocked"
      });
    } else {
      return res.status(500).json({
        message: "Empty node"
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

router.post("/report", async(req, res) => {
  const { createdBy, entityId, message } = req.body;
  try {
    if(entityId && createdBy) {
      let reportShop = new Report({
        entityId,
        createdBy,
        message,
        type: 1
      });
      await reportShop.save();
      return res.status(200).json({
        status: "reported"
      });
    } else {
      return res.status(500).json({
        message: "Empty node"
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

router.post("/unblock", async(req, res) => {
  const { createdBy, entityId } = req.body;
  try {
    if(entityId && createdBy) {
      await blockShop.deleteOne({ entityId, createdBy, type: 1 });
      return res.status(200).json({
        status: "unblocked"
      });
    } else {
      return res.status(500).json({
        message: "Empty node"
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

//get-banners
router.post("/get-banners", async(req, res) => {
  const { 
    shopId
   } = req.body.data;
  try {
    let bannerList = [];
      if(shopId) {
        let banners = await Banner.find({ shopId });
        for(const banner of banners) {
          bannerList.push({
            id: banner._id,
            name: banner.text,
            imageId: banner.imageId,
            style: banner.style,
            shopId: banner.shopId,
            isActive: banner.active,
            createdAt: moment(parseInt(banner.createdAt)).fromNow(),
          });
        }
      }
      return res.status(200).json({
        banners: bannerList,
        status: "banner saved"
      });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});
router.post("/remove-banner", async(req, res) => {
  const { 
    id
   } = req.body;
  try {
      await Banner.deleteOne({
        _id: id
      });
      return res.status(200).json({
        status: "banner removed"
      });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});
router.post("/create-banner", async(req, res) => {
  const { 
    shopId,
    style,
    imageId,
    text,
    activateOnStart
   } = req.body.data;
  try {
      if(activateOnStart) {
        await Banner.updateMany(
          {
            shopId
          },
          {
            $set: {
              active: false
            }
          }
        )
      }

      let newBanner = new Banner({
        shopId,
        style,
        imageId,
        text,
        active: activateOnStart
      })
      await newBanner.save();

      return res.status(200).json({
        status: "banner saved"
      });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});
router.post("/hide-banner", async(req, res) => {
  const { 
    userId,
    shopId,
    active
   } = req.body.data;
  try {
      let hiddenBanner = await HideBanner.findOne({ userId, shopId });
      if(hiddenBanner) {
          await HideBanner.updateOne(
          { userId, shopId },
          { $set: { active } }
        )
      } else {
        let hiddenBanner = new HideBanner({
          userId, shopId, active
        });
        await hiddenBanner.save();
      }
      
      return res.status(200).json({
        status: "banner removed"
      });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

export default router;

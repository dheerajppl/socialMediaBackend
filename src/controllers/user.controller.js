 import { dbMethods, helperUtils } from "../utils/index.js";
 import constants  from "../utils/constants.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import dbModels  from "../utils/db.models.js";
const { HttpStatus } = constants;

const userRegister = async(req, res) =>{
   try {
      if(!req.body.email || !req.body.password || !req.body.username){
         return res.status(401).send(
            helperUtils.errorRes("Email and Password is required", {}, 401)
         )
      }
      req.body.email = req.body.email.toLowerCase();
      let alreadyEmail = await dbMethods.findOne({
          collection: dbModels.User,
          query: { email: req.body.email }
      })
      if (alreadyEmail) {
          return res.status(400).send(
              helperUtils.errorRes("Email Already Exists", {}, 400)
          )
      }
      let alreadyUsername = await dbMethods.findOne({
        collection: dbModels.User,
        query: { username: req.body.username }
      })
      if (alreadyUsername) {
        return res.status(400).send(
            helperUtils.errorRes("UserName Already Exists", {}, 400)
        )
      }
      req.body.password = await helperUtils.bcryptHash(req.body.password)
      await dbMethods.insertOne({
          collection: dbModels.User,
          document: req.body
      })
      return res.status(200).send(
          helperUtils.successRes("Successfully created",
              {}, 200)
      )
  } catch (error) {
      console.log(error)
      return res.status(400).send(helperUtils.errorRes(
          "Bad Request",
          error.message,
          400
      ))
  }
 }

 const userLogin = async (req, res) => {
   try {
      if(!req.body.email || !req.body.password){
         return res.status(401).send(
            helperUtils.errorRes("Email and Password is required", {}, 401)
         )
      }
       let userCheck = await dbMethods.findOne({
           collection: dbModels.User,
           query: { email: req.body.email.toLowerCase() },
       })

       if (!userCheck) {
           return res.status(HttpStatus.BAD_REQUEST)
               .send(helperUtils.errorRes("Email Not Exists", {}))
       }
       if (req.body.password) {
           let verify = await helperUtils.bcryptCompare(req.body.password, userCheck.password)
           if (!verify) {
               return res.status(HttpStatus.BAD_REQUEST)
                   .send(helperUtils.errorRes("Invalid Password"))
           }
       }
       if (userCheck.isDel) {
           return res.status(HttpStatus.BAD_REQUEST).send(helperUtils.errorRes("User Not Active", {}, HttpStatus.BAD_REQUEST))
       }
       

       let payload = {
           _id: userCheck._id,
           name: userCheck.name,
           email: userCheck.email,
           bio: userCheck.bio,
           profilePicture: userCheck.profilePicture,
           followers: userCheck.followers,
           following: userCheck.following,
           posts: userCheck.posts,
           bookmarks: userCheck.bookmarks,

       }
       let token = await helperUtils.jwtSign(payload)

       payload.token = token;
       return res.status(HttpStatus.OK)
           .send(helperUtils.successRes("Successfully login", payload));
   } catch (error) {
       console.log(error)
       return res.status(HttpStatus.BAD_REQUEST)
           .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
   }
}

const logoutUser = async (req, res) => {
   try {
       await dbMethods.updateOne({
           collection: dbModels.User,
           query: { _id: req.body.userId },
           update: { lastInActiveTime: req.body.lastInActiveTime }
       })
       res.status(HttpStatus.OK)
           .send(helperUtils.successRes("Successfully logout", {}))
   } catch (error) {
       return res.status(HttpStatus.BAD_REQUEST)
           .send(helperUtils.errorRes("Bad request", error.message, HttpStatus.BAD_REQUEST));
   }
}

const getProfile = async (req, res) => {
   try {
      const user = await dbMethods.findOne({
          collection: dbModels.User,
          query: { _id: req.params.id },
      })
      res.status(HttpStatus.OK)
          .send(helperUtils.successRes("Successfully get", user))
  } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST)
          .send(helperUtils.errorRes("Bad request", error.message, HttpStatus.BAD_REQUEST));
  }
}

const editProfile = async (req, res) => {
   try {
      let _id = req.User._id
      delete req.body._id
      const profilePicture = req.file;
      if(profilePicture){
         const fileUri = getDataUri(profilePicture);
         const cloudResponse = await cloudinary.uploader.upload(fileUri);
         req.body.profilePicture = cloudResponse.secure_uri;
      }
      
      const user = await dbMethods.updateOne({
          collection: dbModels.User,
          query: { _id: _id },
          update: req.body
      })
      res.status(HttpStatus.OK)
          .send(helperUtils.successRes("Successfully Updated", user))
  } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST)
          .send(helperUtils.errorRes("Bad request", error.message, HttpStatus.BAD_REQUEST));
  }
}

const getSuggestedUsers = async (req, res) => {
   try {
      const suggestedUser = await dbMethods.find({
         collection: dbModels.User,
         query: { _id: { $ne: req.user._id } }
      })
      res.status(HttpStatus.OK)
      .send(helperUtils.successRes("Successfully get", suggestedUser))
   } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST)
          .send(helperUtils.errorRes("Bad request", error.message, HttpStatus.BAD_REQUEST));
   }
}

const followOrUnfollow = async (req, res) => {
   try {
      const { _id: userId } = req.user;
      const { _id: targetUserId } = req.params;
    
      if (userId === targetUserId) {
        return res.status(HttpStatus.BAD_REQUEST)
          .send(helperUtils.errorRes("You can't follow yourself"));
      }
    
      const [user, targetUser] = await Promise.all([
        dbMethods.findOne({ collection: dbModels.User, query: { _id: userId } }),
        dbMethods.findOne({ collection: dbModels.User, query: { _id: targetUserId } })
      ]);
    
      if (!user || !targetUser) {
        return res.status(HttpStatus.BAD_REQUEST)
          .send(helperUtils.errorRes("User not found"));
      }
    
      const isFollowing = user.following.includes(targetUserId);
    
      if (isFollowing) {
        await Promise.all([
          dbMethods.updateOne({
            collection: dbModels.User,
            query: { _id: userId },
            update: { $pull: { following: targetUserId } }
          }),
          dbMethods.updateOne({
            collection: dbModels.User,
            query: { _id: targetUserId },
            update: { $pull: { followers: userId } }
          })
        ]);
    
        return res.status(HttpStatus.OK)
          .send(helperUtils.successRes("Successfully unfollowed"));
      } else {
        await Promise.all([
          dbMethods.updateOne({
            collection: dbModels.User,
            query: { _id: userId },
            update: { $addToSet: { following: targetUserId } }
          }),
          dbMethods.updateOne({
            collection: dbModels.User,
            query: { _id: targetUserId },
            update: { $addToSet: { followers: userId } }
          })
        ]);
    
        return res.status(HttpStatus.OK)
          .send(helperUtils.successRes("Successfully followed"));
      }
   } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST)
        .send(helperUtils.errorRes("Bad request", error.message, HttpStatus.BAD_REQUEST));
   }
    
}

 export default {
   userRegister,
   userLogin,
   logoutUser,
   getProfile,
   editProfile,
   getSuggestedUsers,
   followOrUnfollow
 }

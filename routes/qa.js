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
import Question from '../models/question';
import QuestionReaction from '../models/questionReaction';
import _ from 'lodash';
import path from 'path';
import multer from 'multer';
import mongoose from 'mongoose';
import user from '../models/user';

let router = express.Router();

router.post(
    "/create-question",
    async (req, res) => {
        const {title, category, area, userId, agree} = req.body.question;
        if(title && category.length > 0 && userId && agree) {
            try {
                let question = new Question({
                    title,
                    createdBy: userId,
                    categories: category,
                    area
                });
                await question.save();
                return res.json({
                    status: 200,
                    message: "pass",
                    content: {
                        questionId: question.id
                    }
                })
            }
            catch(error) {
                return res.json({
                    status: 500,
                    error: error
                })            
            }
        }
        return res.json({
            content: req.body.question
        })
    }
  )
router.get(
    "/question",
    async (req, res) => {
        const id = req.query[0];
        const userId = req.query[1];
        let question = await Question.findOne(
            { _id: questionId },
            { createdBy: userId }
        );

        let reaction = [];

        let questionSet = {
            votes:  question.votes,
            categories: question.categories,
            reaction: reaction
        }

        return res.json({
            status: 200,
            content: questionSet
        });
    }
)
router.get(
    "/top-questions",
    async (req, res) => {
        const { id } = req.query;
        
        return res.json({
            content: id
        });
        return res.json({
            content: req.body.question
        })
    }
)

router.post("/question-reaction",
    async(req, res) => {
        const { userId, questionId, reaction  } = req.body;
        if(userId && questionId) {
            let questionReaction = await QuestionReaction.findOne({
                createdBy: userId,
                question: questionId
            });

            if(questionReaction) {
               let updatedUser = await QuestionReaction.updateOne(
                    {createdBy: userId, question:questionId},
                    {$set: {
                        upVote: reaction.upVote,
                        downVote: reaction.downVote,
                        bookmark: reaction.bookmark,
                        flag: reaction.flag,
                    }}
                );
            } else {
                let newQuestionReaction = new QuestionReaction({
                    createdBy: userId,
                    question: questionId,
                    upVote: reaction.upVote,
                    downVote: reaction.downVote,
                    bookmark: reaction.bookmark,
                    flag: reaction.flag,
                });
                await newQuestionReaction.save();
            }
            if(reaction.voteIncrement) {
                await Question.updateOne(
                    { _id: questionId },
                    { $inc: { votes: 1 } }
                )
            } else {
                await Question.updateOne(
                    { _id: questionId },
                    { $inc: { votes: -1 } }
                )
            }

            let votes = await Question.findOne(
                { _id: questionId }
            ).votes

            return res.json({
                status: 200,
                reaction,
                votes: votes
            }) 
        } else {
            return res.json({
                status: 500,
                error: "Question or user not present"
            }) 
        }
    }
);

export default router;

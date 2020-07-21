// import dotenvJSON from "dotenv-json";
// dotenvJSON({
//     path: "../.env.json"
// });

import { UserController } from '../controllers';
import express from 'express';
import moment from 'moment';
import Question from '../models/question';
import Answer from '../models/answer';
import Users from '../models/user';
import Comment from '../models/comment';
import QuestionReaction from '../models/questionReaction';
import AnswerReaction from '../models/answerReaction';
import _ from 'lodash';

import Notification from '../models/notificaton';
import question from '../models/question';

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
                    createdAt: Date.now(),
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
        const { id, userId, clientId } = req.query;
        let question = await Question.findOne(
            { _id: id }
        );
        if(!question) {
            return res.json({
                status: "error",
                message: "question not found"
            })
        } else {

            let views = await Question.updateOne(
                { _id: id},
                {$addToSet: { views: clientId } }
            );

            let questioner = await Users.findById(question.createdBy);
            let questionReaction =  await QuestionReaction.findOne(
                { question: id, createdBy: userId }
            );

            let answers = await Answer.find({
                questionId: id 
            });
            let answerSet = []
            for(const answer of answers) {
                let answerGivenBy = await Users.findById(answer.createdBy);
                let rxn = {
                    upVote: false,
                    downVote: false,
                    bookmark: false,
                    flag: false
                }
                let answerReaction = await AnswerReaction.findOne({
                    createdBy: userId, answer: answer.id
                });
                if(answerReaction) {
                    rxn.upVote = answerReaction.upVote;
                    rxn.downVote = answerReaction.downVote;
                    rxn.bookmark = answerReaction.bookmark;
                    rxn.flag = answerReaction.flag;
                }
                answerSet.push({
                    title: answer.text,
                    comments: [],
                    id: answer.id,
                    answerer: {
                        id: answer.createdBy,
                        dp: answerGivenBy.imageID || "",
                        name: answerGivenBy.name
                    },
                    createdOn: moment(parseInt(answer.createdAt)).fromNow(),
                    primaryAnswer: answer.text,
                    showComment: false,
                    reaction: {
                        upVote: rxn.upVote,
                        downVote: rxn.downVote,
                        bookmark: rxn.bookmark,
                        flag:  rxn.flag,
                        votes: answer.votes
                    }     
                })
            }

            if(questionReaction) {
                let questionSet = {
                    id: question.id,
                    createdOn: moment(parseInt(question.createdAt)).fromNow(),
                    title: question.title,
                    questioner: {
                        name: questioner.name,
                        imageID: questioner.imageID
                    },
                    views: question.views.length,
                    votes:  question.votes,
                    bookmark: questionReaction.bookmark || false,
                    upvote: questionReaction.upVote || false,
                    downvote: questionReaction.downVote || false,
                    categories: question.categories || [],
                    answerSet
                }
                return res.json({
                    status: 200,
                    content: questionSet
                });
            } else {
                let questionSet = {
                    id: question.id,
                    createdOn: moment(parseInt(question.createdAt)).fromNow(),
                    views: question.views.length,
                    title: question.title,
                    questioner: {
                        name: questioner.name,
                        imageID: questioner.imageID
                    },
                    votes:  question.votes,
                    bookmark: false,
                    upvote: false,
                    downvote: false,
                    categories: question.categories || [],
                    answerSet
                }
                return res.json({
                    status: 200,
                    content: questionSet
                });
            }
        }
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
            if(reaction.voteIncrement === "up") {
                await Question.updateOne(
                    { _id: questionId },
                    { $inc: { votes: 1 } }
                )
                let question = await Question.findById({questionId});
                let user = await Users.findById({ userId });
                let newNotification = new Notification({
                    userId,
                    type: 2,
                    postId: questionId,
                    postTitle: question.title,
                    postOwner: question.createdBy,
                    engagementBy: userId
                });
            } else {
                if(reaction.voteIncrement === "down") {
                    await Question.updateOne(
                        { _id: questionId },
                        { $inc: { votes: -1 } }
                    )
                }
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

router.post("/answer-reaction",
    async(req, res) => {
        const { userId, answerId, reaction  } = req.body;
        if(userId && answerId) {
            let answerReaction = await AnswerReaction.findOne({
                createdBy: userId,
                answer: answerId
            });

            if(answerReaction) {
               let updatedUser = await AnswerReaction.updateOne(
                    {createdBy: userId, answer:answerId},
                    {$set: {
                        upVote: reaction.upVote,
                        downVote: reaction.downVote,
                        bookmark: reaction.bookmark,
                        flag: reaction.flag,
                    }}
                );
            } else {
                let newAnswerReaction = new AnswerReaction({
                    createdBy: userId,
                    answer: answerId,
                    upVote: reaction.upVote,
                    downVote: reaction.downVote,
                    bookmark: reaction.bookmark,
                    flag: reaction.flag,
                });
                await newAnswerReaction.save();
            }
            if(reaction.voteIncrement === "up") {
                await Answer.updateOne(
                    { _id: answerId },
                    { $inc: { votes: 1 } }
                )
                let answer = await Answer.findOne({ _id: answerId});
                let user = await Users.findOne({ _id: userId });
                let newNotification = new Notification({
                    userId,
                    type: 3,
                    postId: answerId,
                    postTitle: answer.text,
                    postOwner: answer.createdBy,
                    engagementBy: userId,
                    imageID: user.imageID
                });
                await newNotification.save();
            } else {
                if(reaction.voteIncrement === "down") {
                    await Answer.updateOne(
                        { _id: answerId },
                        { $inc: { votes: -1 } }
                    )
                }
            }

            let votes = await Answer.findOne(
                { _id: answerId }
            ).votes

            return res.json({
                status: 200,
                reaction,
                votes: votes
            }) 
        } else {
            return res.json({
                status: 500,
                error: "Answer or user not present"
            }) 
        }
    }
);

router.post("/submit-answer",
    async(req, res) => {
        const { answer, questionId, userId  } = req.body;
        try {
            if(answer &&  questionId  && userId) {
                let answerWritten =  Answer({
                    questionId,
                    createdBy:   userId,
                    text: answer.title,
                    createdAt: Date.now()
                });
                let question = await Question.findOne({ _id: questionId});
                if(!question.isAnswered || question.isAnswered === null) {
                    question.isAnswered = true;
                    await question.save();
                }
                let user = await Users.findOne({ _id: userId });
                let newNotification = new Notification({
                    userId,
                    type: 1,
                    postId: questionId,
                    postTitle: question.title,
                    postOwner: question.createdBy,
                    engagementBy: userId,
                    imageID: user.imageID
                });
                await newNotification.save();
                await answerWritten.save();
                return res.json({
                    status: 200,
                    message: "success"
                });
            } else {
                return res.json({
                    status: 500,
                    error: "content missing"
                })     
            }
        }
        catch(err) {
            console.log(err)
            return res.json({
                status: 500,
                error: err
            }) 
        }
    }
);

router.post("/comment", async(req, res) => {
    async (req, res) => {
        const { postId, text, userId  } = req.body;
        if(postId && questionId && userId) {
            //let Comment
            let newComment = new Comment({
                postId,
                text,
            });
            await newComment.save()
        }
    }
});

router.post("/getQuestions", async(req, res) => {
    const { type  } = req.body;
    if(type) {
        let questionsSet = [];
        let questions = null;
        switch(type) {
            case "top":
                questions = await Question.find().sort({ votes: 1 }).limit(20);
            break;
            case "unanswered":
                questions = await Question.find().sort({ isAnswered: false }).limit(20);
            break;
        }
        for(const question of questions) {
            let answers  = await Answer.find({
                questionId: question.id
            });
            let questionTemp = {
                title: question.title,
                askedOn: moment(parseInt(question.createdAt)).fromNow(),
                tags: question.categories,
                area: question.area,
                votes: question.votes,
                views: question.views.length,
                id: question._id,
                answers: answers.length
            }
            questionsSet.push(questionTemp);
        }
        return res.status(200).json({
            result: "pass",
            questionsSet
        })
    }
})

export default router;

import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

// Create tweet
router.post('/', async (req, res) => {
  const { content, image } = req.body
  //@ts-ignore
  const user = req.user;
try {

     const result = await prisma.tweet.create({
      data: {
        content,
        image,
        userId: user.id
      }
    })
    res.json(result)
  } catch (e) {
    res.status(400).json({ error: "Failed to create tweet" })
  }
})

// List tweets
router.get('/', async (req, res) => {
  const allTweets = await prisma.tweet.findMany({
    include: {user: { select : { 
      id: true,
      name: true,
      username: true,
      image: true,
    }}}
  });
  res.json(allTweets)
})

// Get one tweet
router.get('/:id', async (req, res) => {
  const {id} = req.params;
  const tweet = await prisma.tweet.findUnique({
    where: {
      id: Number(id)
    },
    include: {
      user: true,
    }
  })

  if (!tweet) {
    return res.status(404).json({ error: "Tweet not found!" })
  }
  res.json(tweet);
})

// Update tweet
router.put('/:id', (req, res) => {
  const {id} = req.params;
  res.status(501).json({ error: `Not Implemented: ${id}`})
})

// Delete tweet
router.delete('/:id', async(req, res) => {
  const {id} = req.params;
  await prisma.tweet.delete({ where: { id: Number(id) }});
  res.sendStatus(200);
})

export default router;
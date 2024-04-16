import { Router } from "express";
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Create user
router.post('/', async (req, res) => {
  try {

  const { email, name, username } = req.body;
  const user = await prisma.user.create({
    data: {
      email,
      name,
      username,
      bio: "Hello, I'm new on Twitter",
    }
  })
  res.json(user);
} catch (e) {
  res.status(400).json({ error: 'Username and email should be unique '})
}
})

// List users
router.get('/', async(req, res) => {
  const allUser = await prisma.user.findMany();
  res.json(allUser);
})

// Get one user
router.get('/:id', async (req, res) => {
  const {id} = req.params;
  const user = await prisma.user.findUnique({
    where: {
      id: Number(id),
    }
  })
  res.json(user);
})

// Update user
router.put('/:id', async(req, res) => {
  const {id} = req.params;
  const {bio, name, image} = req.body; 
  try {
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        bio,
        name,
        image,
      }
    })
    res.json(user)
  } catch (e) {
  res.status(400).json({ error: `Failed to update the user`})

  }
})

// Delete user
router.delete('/:id', async (req, res) => {
  const {id} = req.params;
  await prisma.user.delete({ where: {
    id: Number(id)
  }})
  res.sendStatus(200);
})

export default router;
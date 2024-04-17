import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

const EMAIL_TOKEN_EXPIRATION_MINUTES = 10;
const AUTHENTICATION_EXPIRATION_HOURS = 12;
const JWT_SECRET = "secret key";

function generateEmailToken(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

function generateAuthToken(tokenId: number): string {
  const jwtPayload = { tokenId };

  return jwt.sign(jwtPayload, JWT_SECRET, {
    algorithm: "HS256",
    noTimestamp: true,
  });
}

// Create a user, if it doesn't exist,
// generate the emailToken and send it to their email

router.post('/login', async(req, res) => {
  const { email } = req.body;
  const emailToken = generateEmailToken();
  const expiration = new Date(new Date().getTime() + EMAIL_TOKEN_EXPIRATION_MINUTES * 60 * 1000)

  try {
  const createdToken = await prisma.token.create({
    data: {
      type: 'EMAIl',
      emailToken,
      expiration,
      user: {
        connectOrCreate: {
          where: { email },
          create: { email },
        }
      }
    }
  })
  res.sendStatus(200);
} catch(err) {
  console.log(err);
  res.status(400).json({ error: "Couldn't start the authentication process" });
}

})

// Validate the emailToken
// Generate a long-lived JWT token
router.post('/authenticate', async(req, res) => {
  const { email, emailToken } = req.body;
  const dbEmailToken = await prisma.token.findUnique({
    where: {
      emailToken,
      user: {
        email
      }
    },
    include: {
      user: true
    }
  })

  if (!dbEmailToken || !dbEmailToken.valid) {
    return res.sendStatus(401);
  }

  if (dbEmailToken.expiration < new Date()) {
    return res.status(401).json({ error: "Token expired!" });
  }

  const expiration = new Date(
    new Date().getTime() + AUTHENTICATION_EXPIRATION_HOURS * 60 * 60 * 1000
  )

  const apiToken = await prisma.token.create({
    data: {
      type: 'API',
      expiration,
      user: {
        connect: {
          email
        }
      }
    }
  })

  //Invalidate the email
  await prisma.token.update({
    where: { id: dbEmailToken.id },
    data: { valid: false },
  });

  //Generate the JWT token
  const authToken = generateAuthToken(apiToken.id);

  res.json({ authToken });
})

export default router;

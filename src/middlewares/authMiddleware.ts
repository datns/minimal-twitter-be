import { PrismaClient, User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "";

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers['authorization']
    const jwtToken = authHeader?.split(" ")[1];
    if (!jwtToken) {
      return res.sendStatus(401)
    }
      const payload = await jwt.verify(jwtToken, JWT_SECRET) as { tokenId: number };
      const dbToken = await prisma.token.findUnique({
        where: { id: payload.tokenId },
        include: { user: true }
      })
  
      if (!dbToken?.valid || dbToken.expiration < new Date()) {
        return res.status(401).json({ error: "API token expired" });
      }

      //@ts-ignore
      req.user = dbToken.user;
    } catch (err) {
      return res.sendStatus(401);
    }

    next();
}
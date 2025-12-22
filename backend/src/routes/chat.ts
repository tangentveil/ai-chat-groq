import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma";
import { generateReply } from "../services/llm";
import type { Message } from "@prisma/client";

const router = Router();

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.uuid().optional(),
});

router.post("/message", async (req, res) => {
  console.log(req.body);
  try {
    const { message, sessionId } = chatSchema.parse(req.body);

    let conversationId = sessionId;

    if (!conversationId) {
      const newConversation = await prisma.conversation.create({
        data: {},
      });
      conversationId = newConversation.id;
    }

    // store user message
    await prisma.message.create({
      data: {
        conversationId,
        sender: "user",
        text: message,
      },
    });

    // call LLM

    const history = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: 10,
    });

    let reply: string;
    try {
      reply = await generateReply(
        history.map((m: Message) => ({ sender: m.sender, text: m.text })),
        message
      );
    } catch {
      reply =
        "Sorry, I'm having trouble responding right now. Please try again in a moment.";
    }

    // store ai reply

    await prisma.message.create({
      data: {
        conversationId,
        sender: "ai",
        text: reply,
      },
    });

    return res.json({ reply, sessionId: conversationId });
  } catch (error: any) {
    console.log(error);

    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Invalid input." });
    }

    return res
      .status(500)
      .json({ error: "Something went wrong. Please try again." });
  }
});

export default router;

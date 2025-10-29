import { Request, Response } from "express";
import { Conversation } from "../models/Conversation";
import { ActionPlan } from "../models/ActionPlan";
import { intentService } from "../services/intentService";
import { questionService } from "../services/questionService";
import { plannerService } from "../services/plannerService";
import { ChatResponse } from "../types";

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { message, conversationId } = req.body;
    const userId = req.user!.userId;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // Find or create conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      if (!conversation || conversation.userId.toString() !== userId) {
        return res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
      }
    } else {
      conversation = new Conversation({
        userId,
        messages: [],
        status: "active",
      });
    }

    // Add user message
    conversation.messages.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    });

    // Recognize intent
    const intent = await intentService.recognizeIntent(message);
    conversation.intent = intent;

    // Generate follow-up questions
    const questions = await questionService.generateQuestions(intent);

    // Add assistant response
    const assistantMessage =
      questions.length > 0
        ? "I'll help you create a comprehensive plan! Let me ask you a few questions:"
        : "I understand. Let me create a plan for you.";

    conversation.messages.push({
      role: "assistant",
      content: JSON.stringify({ message: assistantMessage, questions }),
      timestamp: new Date(),
    });

    await conversation.save();

    const response: ChatResponse = {
      conversationId: (conversation._id as any).toString(),
      response: {
        type: questions.length > 0 ? "follow_up_questions" : "text",
        message: assistantMessage,
        questions: questions.length > 0 ? questions : undefined,
      },
    };

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process message",
    });
  }
};

export const submitAnswers = async (req: Request, res: Response) => {
  try {
    const { conversationId, answers } = req.body;
    const userId = req.user!.userId;

    if (!conversationId || !answers) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID and answers are required",
      });
    }

    // Find conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || conversation.userId.toString() !== userId) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Add user answers
    conversation.messages.push({
      role: "user",
      content: JSON.stringify(answers),
      timestamp: new Date(),
    });

    // Generate plan
    const plan = await plannerService.generatePlan(
      conversation.intent,
      answers
    );

    // Create action plan
    const actionPlan = new ActionPlan({
      conversationId: conversation._id,
      userId,
      intent: conversation.intent,
      summary: plan.summary,
      category: plan.category,
      actions: plan.actions.map((action) => ({
        ...action,
        status: "pending",
      })),
      executed: false,
    });

    await actionPlan.save();

    // Update conversation
    conversation.planId = (actionPlan._id as any).toString();
    conversation.messages.push({
      role: "assistant",
      content: JSON.stringify({ plan }),
      timestamp: new Date(),
    });

    await conversation.save();

    const response: ChatResponse = {
      conversationId: (conversation._id as any).toString(),
      response: {
        type: "action_plan",
        planId: (actionPlan._id as any).toString(),
        summary: plan.summary,
        actions: plan.actions,
      },
    };

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Submit answers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process answers",
    });
  }
};

export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const conversations = await Conversation.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .select("-messages");

    res.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
    });
  }
};

export const getConversation = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user!.userId;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || conversation.userId.toString() !== userId) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    res.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error("Get conversation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversation",
    });
  }
};

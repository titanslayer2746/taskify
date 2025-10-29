import { Request, Response } from "express";
import { ActionPlan } from "../models/ActionPlan";
import { Conversation } from "../models/Conversation";
import { ApiService } from "../services/apiService";

export const executePlan = async (req: Request, res: Response) => {
  try {
    const { planId, confirmations } = req.body;
    const userId = req.user!.userId;
    const token = req.headers.authorization?.split(" ")[1];

    if (!planId || !token) {
      return res.status(400).json({
        success: false,
        message: "Plan ID is required",
      });
    }

    // Find action plan
    const actionPlan = await ActionPlan.findById(planId);
    if (!actionPlan || actionPlan.userId.toString() !== userId) {
      return res.status(404).json({
        success: false,
        message: "Action plan not found",
      });
    }

    if (actionPlan.executed) {
      return res.status(400).json({
        success: false,
        message: "Plan already executed",
      });
    }

    // Filter actions based on confirmations and ensure proper type
    const actionsToExecute = actionPlan.actions
      .filter((action) => {
        if (!confirmations) return true;
        return confirmations[action.type] !== false;
      })
      .map((action) => ({
        type: action.type,
        count: action.count,
        preview: action.preview,
        category: actionPlan.category,
        data: action.data,
        status: action.status,
      }));


    // Execute actions
    const apiService = new ApiService(token);

    // Set up SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering if present

    const totalTasks = actionsToExecute.reduce((sum, action) => sum + action.count, 0);
    
    // Send initial progress update
    const initialProgress = {
      type: "progress",
      data: {
        currentStep: "Initializing execution...",
        completed: 0,
        total: totalTasks,
        status: "in_progress",
      },
    };
    res.write(`data: ${JSON.stringify(initialProgress)}\n\n`);

    let finalResults: any[] = [];
    let finalErrors: any[] = [];
    let executionSuccess = true;

    try {
      const { success, results, errors } = await apiService.executeActions(
        actionsToExecute as any,
        (progress) => {
          // Send progress update via SSE
          const progressData = {
            type: "progress",
            data: {
              currentStep: progress.step,
              completed: progress.completed,
              total: progress.total,
              status: progress.status,
              errors: progress.errors,
            },
          };
          const data = `data: ${JSON.stringify(progressData)}\n\n`;
          res.write(data);
          // Ensure data is sent immediately by forcing a flush
          // Express doesn't have flush by default, but we ensure data is written
        }
      );

      finalResults = results;
      finalErrors = errors;
      executionSuccess = success;
    } catch (executionError: any) {
      console.error("Execution error:", executionError);
      finalErrors.push({
        action: "execution",
        error: executionError.message || "Execution failed",
      });
      executionSuccess = false;
      
      // Send error progress update
      const errorProgress = {
        type: "progress",
        data: {
          currentStep: "Execution failed",
          completed: 0,
          total: actionsToExecute.reduce((sum, a) => sum + a.count, 0),
          status: "failed",
          errors: [executionError.message || "Execution failed"],
        },
      };
      res.write(`data: ${JSON.stringify(errorProgress)}\n\n`);
    }

    // Update action plan
    actionPlan.executed = true;
    actionPlan.executedAt = new Date();

    // Update action statuses
    actionsToExecute.forEach((action) => {
      const planAction = actionPlan.actions.find((a) => a.type === action.type);
      if (planAction) {
        planAction.status = finalErrors.some((e) => e.action === action.type)
          ? "failed"
          : "completed";
      }
    });

    await actionPlan.save();

    // Update conversation
    const conversation = await Conversation.findById(actionPlan.conversationId);
    if (conversation) {
      conversation.status = "completed";
      conversation.messages.push({
        role: "system",
        content: executionSuccess
          ? "Plan executed successfully!"
          : "Plan executed with some errors.",
        timestamp: new Date(),
      });
      await conversation.save();
    }

    // Send final result
    const finalData = {
      type: "complete",
      data: {
        success: executionSuccess,
        results: finalResults,
        errors: finalErrors,
        message: executionSuccess
          ? "Plan executed successfully!"
          : "Plan executed with some errors.",
      },
    };
    res.write(`data: ${JSON.stringify(finalData)}\n\n`);
    res.end();
  } catch (error: any) {
    console.error("Execute plan error:", error);
    
    // Send error via SSE before closing
    const errorData = {
      type: "error",
      data: {
        success: false,
        message: "Failed to execute plan",
        error: error.message,
      },
    };
    try {
      res.write(`data: ${JSON.stringify(errorData)}\n\n`);
    } catch (writeError) {
      // Connection may already be closed
    }
    res.end();
  }
};

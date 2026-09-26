import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  IProject,
  Project,
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
} from "../models/Project";

const MAX_IMPORT = 200;

type ProjectInput = Partial<
  Pick<
    IProject,
    | "title"
    | "description"
    | "status"
    | "priority"
    | "progress"
    | "dueDate"
    | "tags"
    | "estimatedHours"
    | "actualHours"
    | "color"
  >
>;

const toResponse = (project: IProject) => ({
  id: project._id,
  title: project.title,
  description: project.description,
  status: project.status,
  priority: project.priority,
  progress: project.progress,
  dueDate: project.dueDate,
  tags: project.tags,
  estimatedHours: project.estimatedHours,
  actualHours: project.actualHours,
  color: project.color,
  createdAt: project.createdAt,
  updatedAt: project.updatedAt,
});

const isNonNegativeNumber = (v: unknown) =>
  typeof v === "number" && Number.isFinite(v) && v >= 0;

// Validates the fields present in `body` and returns a clean update object,
// or an error message. With `requireTitle`, a title must be provided.
const parseProjectInput = (
  body: Record<string, unknown>,
  requireTitle: boolean
): { data: ProjectInput } | { error: string } => {
  const data: ProjectInput = {};

  if (body.title !== undefined || requireTitle) {
    if (typeof body.title !== "string" || !body.title.trim()) {
      return { error: "Project title is required" };
    }
    if (body.title.trim().length > 100) {
      return { error: "Project title must be 100 characters or less" };
    }
    data.title = body.title.trim();
  }

  if (body.description !== undefined) {
    if (typeof body.description !== "string") {
      return { error: "Description must be text" };
    }
    if (body.description.trim().length > 1000) {
      return { error: "Description must be 1000 characters or less" };
    }
    data.description = body.description.trim();
  }

  if (body.status !== undefined) {
    if (!PROJECT_STATUSES.includes(body.status as never)) {
      return { error: `Status must be one of: ${PROJECT_STATUSES.join(", ")}` };
    }
    data.status = body.status as IProject["status"];
  }

  if (body.priority !== undefined) {
    if (!PROJECT_PRIORITIES.includes(body.priority as never)) {
      return {
        error: `Priority must be one of: ${PROJECT_PRIORITIES.join(", ")}`,
      };
    }
    data.priority = body.priority as IProject["priority"];
  }

  if (body.progress !== undefined) {
    if (!isNonNegativeNumber(body.progress) || (body.progress as number) > 100) {
      return { error: "Progress must be a number between 0 and 100" };
    }
    data.progress = Math.round(body.progress as number);
  }

  if (body.dueDate !== undefined) {
    if (
      body.dueDate !== null &&
      body.dueDate !== "" &&
      (typeof body.dueDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(body.dueDate))
    ) {
      return { error: "Due date must be in YYYY-MM-DD format" };
    }
    data.dueDate = (body.dueDate as string) || undefined;
  }

  if (body.tags !== undefined) {
    if (
      !Array.isArray(body.tags) ||
      body.tags.length > 10 ||
      body.tags.some((t) => typeof t !== "string" || !t.trim() || t.trim().length > 30)
    ) {
      return { error: "Tags must be up to 10 words of 30 characters or less" };
    }
    data.tags = [...new Set((body.tags as string[]).map((t) => t.trim()))];
  }

  for (const key of ["estimatedHours", "actualHours"] as const) {
    if (body[key] !== undefined && body[key] !== null) {
      if (!isNonNegativeNumber(body[key])) {
        return { error: "Hours must be zero or more" };
      }
      data[key] = body[key] as number;
    } else if (body[key] === null) {
      data[key] = undefined;
    }
  }

  if (body.color !== undefined && body.color !== null && body.color !== "") {
    if (typeof body.color !== "string" || !/^#[0-9a-fA-F]{6}$/.test(body.color)) {
      return { error: "Colour must be a hex value like #1F3326" };
    }
    data.color = body.color;
  }

  return { data };
};

const requireUser = (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ success: false, message: "Authentication required" });
    return null;
  }
  return userId;
};

const findOwnedProject = async (projectId: string, userId: string) => {
  if (!mongoose.isValidObjectId(projectId)) return null;
  return Project.findOne({ _id: projectId, userId });
};

// Create a project
export const createProject = async (req: Request, res: Response) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const parsed = parseProjectInput(req.body ?? {}, true);
    if ("error" in parsed) {
      return res.status(400).json({ success: false, message: parsed.error });
    }

    const project = await Project.create({ ...parsed.data, userId });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: { project: toResponse(project) },
    });
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// List all projects for the user, newest first
export const getProjects = async (req: Request, res: Response) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const projects = await Project.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Projects retrieved successfully",
      data: { projects: projects.map(toResponse) },
    });
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get one project
export const getProject = async (req: Request, res: Response) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const project = await findOwnedProject(req.params.projectId, userId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.status(200).json({
      success: true,
      message: "Project retrieved successfully",
      data: { project: toResponse(project) },
    });
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update any subset of a project's fields
export const updateProject = async (req: Request, res: Response) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const project = await findOwnedProject(req.params.projectId, userId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const parsed = parseProjectInput(req.body ?? {}, false);
    if ("error" in parsed) {
      return res.status(400).json({ success: false, message: parsed.error });
    }

    project.set(parsed.data);
    await project.save();

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: { project: toResponse(project) },
    });
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Delete a project
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const project = await findOwnedProject(req.params.projectId, userId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    await project.deleteOne();

    res.status(200).json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Import projects in one go (used to move browser-only projects to the account).
// Invalid items are skipped and reported rather than failing the whole import.
export const importProjects = async (req: Request, res: Response) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const items = req.body?.projects;
    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Send a non-empty projects array" });
    }
    if (items.length > MAX_IMPORT) {
      return res.status(400).json({
        success: false,
        message: `At most ${MAX_IMPORT} projects can be imported at once`,
      });
    }

    const valid: (ProjectInput & { userId: string })[] = [];
    const skipped: { index: number; reason: string }[] = [];
    items.forEach((item: unknown, index: number) => {
      const parsed = parseProjectInput((item ?? {}) as Record<string, unknown>, true);
      if ("error" in parsed) skipped.push({ index, reason: parsed.error });
      else valid.push({ ...parsed.data, userId });
    });

    const created = valid.length ? await Project.insertMany(valid) : [];

    res.status(201).json({
      success: true,
      message: `Imported ${created.length} project${created.length === 1 ? "" : "s"}`,
      data: {
        projects: created.map((p) => toResponse(p as unknown as IProject)),
        skipped,
      },
    });
  } catch (error) {
    console.error("Import projects error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

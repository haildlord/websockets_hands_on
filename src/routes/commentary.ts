import { Router, Request, Response } from "express";
import { createCommentarySchema, listCommentaryQuerySchema } from "../validation/commentary";
import { db } from "../prisma/db";

export const commentaryRouter = Router({ mergeParams: true });

const MAX_LIMIT: number = 100;

async function getCommentary(req: Request, res: Response) {
    const payload = listCommentaryQuerySchema.safeParse(req.query);

    if (!payload.success) {
        return res.status(400).json({
            error: "Invalid query",
            details: payload.error.issues,
        });
    }

    const rawMatchId = req.params.matchId ?? req.params.id ?? req.query.matchId;
    let limit: number = payload.data.limit ?? 50;
    limit = Math.min(limit, MAX_LIMIT);

    try {
        let commentaries;

        if (rawMatchId !== undefined) {
            const matchId = Number(rawMatchId);
            if (Number.isNaN(matchId)) {
                return res.status(400).json({
                    error: "Invalid match ID",
                    details: "Match ID must be a valid number",
                });
            }

            commentaries = await db.orm.public.Commentary
                .where({ matchId })
                .orderBy((c) => c.createdAt.desc())
                .limit(limit)
                .all();
        } else {
            commentaries = await db.orm.public.Commentary
                .orderBy((c) => c.createdAt.desc())
                .limit(limit)
                .all();
        }

        if (commentaries.length === 0) {
            return res.status(404).json({
                details: "Commentary not found",
            });
        }

        return res.status(200).json({
            data: commentaries,
        });
    } catch (err) {
        return res.status(500).json({
            error: "Failed to fetch commentary",
            details: err instanceof Error ? err.message : JSON.stringify(err),
        });
    }
}

async function postCommentary(req: Request, res: Response) {
    const rawMatchId = req.params.matchId ?? req.params.id ?? req.body?.matchId;

    if (!rawMatchId) {
        return res.status(400).json({
            error: "Missing match ID",
            details: "Match ID must be provided in URL parameters or request body.",
        });
    }

    const matchId = Number(rawMatchId);
    if (Number.isNaN(matchId)) {
        return res.status(400).json({
            error: "Invalid match ID",
            details: "Match ID must be a valid number.",
        });
    }

    const payload = createCommentarySchema.safeParse(req.body);

    if (!payload.success) {
        return res.status(400).json({
            error: "Invalid Payload",
            details: payload.error.issues,
        });
    }

    try {
        const match = await db.orm.public.Matches.where({ id: matchId }).first();
        if (!match) {
            return res.status(404).json({
                error: "Match not found",
                details: `Match with ID ${matchId} does not exist.`,
            });
        }

        const commentary = await db.orm.public.Commentary.create({
            matchId,
            minute: payload.data.minute ?? payload.data.minutes ?? null,
            sequence: payload.data.sequence ?? null,
            period: payload.data.period ?? null,
            eventType: payload.data.eventType ?? null,
            actor: payload.data.actor ?? null,
            team: payload.data.team ?? null,
            message: payload.data.message,
            metaData: payload.data.metaData ?? payload.data.metadata ?? null,
            tags: payload.data.tags ?? [],
        });

        const broadcast = req.app.locals.broadCastCommentaryCreated || req.app.locals.broadcastCommentaryCreated;
        if (broadcast) {
            broadcast(commentary);
        }

        return res.status(201).json({
            message: "Commentary created successfully",
            commentary,
        });
    } catch (err) {
        return res.status(500).json({
            error: "Failed to create commentary",
            details: err instanceof Error ? err.message : JSON.stringify(err),
        });
    }
}

// Support both "/" (when mounted on /matches/:id/commentary or /commentary) and "/:matchId" (when mounted on /commentary)
commentaryRouter.get("/", getCommentary);
commentaryRouter.get("/:matchId", getCommentary);

commentaryRouter.post("/", postCommentary);
commentaryRouter.post("/:matchId", postCommentary);

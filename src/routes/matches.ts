import { Router } from "express";
import { createMatchSchema, listMatchesQuerySchema} from "../validation/matches";
import { db } from "../prisma/db";
import { getMatchStatus } from "../utils/match-status";
import { Temporal } from "temporal-polyfill";

export const matchRouter = Router();

const MAX_LIMIT : number = 100;

matchRouter.get("/", async (req, res) => {
    
    const payload = listMatchesQuerySchema.safeParse(req.query);
    
    
    if(!payload.success){
        return res.status(400).json({
            error : "Invalid query",
            details: JSON.stringify(payload.error)
        })
    }

    let limit : number = payload.data.limit ?? 50;
    limit = Math.min(limit, MAX_LIMIT);

    try {

        const matches = await db.orm.public.Matches
        .orderBy((m) => m.createdAt.desc())
        .limit(limit)
        .all();
        
        if(matches.length === 0){
            return res.status(404).json({
                details : "Matches not found"
            });
        }

        return res.status(200).json({
            data : matches,
        });

    } catch (err) {
        return res.status(500).json({
            error: "Failed to fetch matches",
            details: err instanceof Error ? err.message : JSON.stringify(err),
        });
    }
});


matchRouter.post("/", async (req, res) => {
    const payload = createMatchSchema.safeParse(req.body);
    if(!payload.success) {
        return res.status(404).json({
            error   :   "Invalid Payload",
            details :   JSON.stringify(payload.error)
        })
    }

    try{

        const match = await db.orm.public.Matches.create({
            sport       : payload.data.sport,
            homeTeam    : payload.data.homeTeam,
            awayTeam    : payload.data.awayTeam,
            startTime   : payload.data.startTime ? Temporal.Instant.from(payload.data.startTime) : null,
            endTime     : payload.data.endTime ? Temporal.Instant.from(payload.data.endTime) : null,
            homeScore   : payload.data.homeScore ?? 0,
            awayScore   : payload.data.awayScore ?? 0,
            status      : getMatchStatus(new Date(payload.data.startTime), new Date(payload.data.endTime))
          });

          return res.status(201).json({
            message: "Match created successfully",
            match,
          });
                    
    }catch(err){
        return res.status(500).json({
            error   :   "Failed to Create Match",
            details :   JSON.stringify(err)
        })
    }
})
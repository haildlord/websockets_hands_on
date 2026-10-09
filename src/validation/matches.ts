import {z} from "zod";

export const MATCH_STATUS = {
    SCHEDULED : 'scheduled',
    LIVE      : 'live',
    FINISHED  : 'finished'     
} as const;

export type MatchStatus = typeof MATCH_STATUS[keyof typeof MATCH_STATUS];


export const createMatchSchema = z.object({
    sport           : z.string().min(3),
    homeTeam        : z.string().min(3),
    awayTeam        : z.string().min(3),
    startTime       : z.iso.datetime(),
    endTime         : z.iso.datetime(),

    // * here below : z.number accepts : 1.5, coerce : even lets us accept "1.5" as input
    // * then int() : forces it to be only 1 not 1.5, nonnegative : not -ve
    homeScore       : z.coerce.number().int().nonnegative().optional(),
    awayScore       : z.coerce.number().int().nonnegative().optional(),

}).superRefine((data, ctx) => {
    
    const {startTime, endTime} = data;

    const start = new Date(startTime);
    const end = new Date(endTime);

    if(start >= end){
        ctx.addIssue({
            code    :   z.ZodIssueCode.custom,
            message :   "endTime must be after startTime",
            path    :   ["endTime"]   
        });
    }
})

export const listMatchesQuerySchema = z.object({
    limit : z.coerce.number().int().positive().max(100).optional()
})
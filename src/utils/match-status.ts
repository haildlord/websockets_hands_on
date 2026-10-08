import { MATCH_STATUS, type MatchStatus } from "../validation/matches";

export function getMatchStatus(startTime : Date, endTime : Date) : MatchStatus {

    const start = new Date(startTime);
    const end   = new Date(endTime);
    
    if(Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())){
        return MATCH_STATUS.SCHEDULED;
    }

    const now = new Date();

    if(now < start){
        return MATCH_STATUS.SCHEDULED;
    }

    if(now >= end){
        return MATCH_STATUS.FINISHED;
    }

    return MATCH_STATUS.LIVE;
}
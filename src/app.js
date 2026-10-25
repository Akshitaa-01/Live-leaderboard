import express from 'express';
import Redis from 'ioredis';

const app=express();
const redis=new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

app.use(express.json());

function view(id){
    return `view:${id}`;
}

function user(userid){
    return `user:${userid}`;
}
app.post("/post/:id/views",async (req,res)=>{
    const id=view(req.params.id);
    const views=await redis.incr(id);

    res.json({curr_view_cnt:views});
})

app.post("/leaderboard/score",async(req,res)=>{
    const {id,score}=req.body;
    const userid=user(id);
    await redis.zincrby('leaderboard',score,userid);
    res.json({message:'Score updated successfully'});
});

app.get("/leaderboard",async(req,res)=>{
    const leaderboard=await redis.zrevrange('leaderboard',0,9,'WITHSCORES');
    res.json({leaderboard});
});

app.get("/user/:id/score",async(req,res)=>{
    const id=user(req.params.id);
    const score=await redis.zscore('leaderboard',id);
    res.json({score});
});

app.listen(8080,()=>{
    console.log('Server is running on port 8080');
})
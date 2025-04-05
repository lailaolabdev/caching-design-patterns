import Redis from "ioredis";

const redisClient = new Redis({
  host: "localhost",
  port: 6379,
  db: 0,
});

redisClient.on("connect", () => {
  console.log("✅ Connected to Redis");
});

export default redisClient;

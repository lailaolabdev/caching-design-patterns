import { Options } from "swagger-jsdoc";

const swaggerDoc: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Tool API with Caching Patterns",
      version: "1.0.0",
      description: "API using cache-aside, write-through, and write-behind patterns with MongoDB and Redis",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local server",
      },
    ],
  },
  apis: ["./src/patterns/*.ts"], // <--- scan JSDoc comments in these files
};

export default swaggerDoc;

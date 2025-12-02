// import {
//   APIGatewayProxyEvent,
//   APIGatewayProxyResult,
//   Context,
// } from "aws-lambda";
// import app from "./app";
// import serverless from "serverless-http";

// const handler = serverless(app);

// export const main = async (
//   event: APIGatewayProxyEvent,
//   context: Context
// ): Promise<APIGatewayProxyResult> => {
//   console.log("Lambda invoked:", event.path, event.httpMethod);

//   // Optional: Prevent Lambda from waiting for empty event loop
//   context.callbackWaitsForEmptyEventLoop = false;

//   return handler(event, context);
// };

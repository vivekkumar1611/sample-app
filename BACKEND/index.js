import {
  DynamoDBClient,
  ScanCommand,
  PutItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";

const db = new DynamoDBClient({ region: "eu-north-1" });
const TABLE = "users";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
};

export const handler = async (event) => {
  console.log("EVENT:", JSON.stringify(event));

  const method = event.requestContext?.http?.method;
  const path = event.rawPath;

  // ✅ CORS PREFLIGHT
  if (method === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  try {
    // CREATE USER
    if (method === "POST" && path === "/users") {
      const body = JSON.parse(event.body || "{}");

      if (!body.name || !body.email) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: "name and email required" }),
        };
      }

      const id = Date.now().toString();

      await db.send(
        new PutItemCommand({
          TableName: TABLE,
          Item: {
            id: { S: id },
            name: { S: body.name },
            email: { S: body.email },
          },
        })
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "User created", id }),
      };
    }

    // GET USERS
    if (method === "GET" && path === "/users") {
      const data = await db.send(new ScanCommand({ TableName: TABLE }));

      const users =
        data.Items?.map((i) => ({
          id: i.id.S,
          name: i.name.S,
          email: i.email.S,
        })) || [];

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(users),
      };
    }

    // DELETE USER
    if (method === "DELETE" && path.startsWith("/users/")) {
      const id = path.split("/")[2];

      await db.send(
        new DeleteItemCommand({
          TableName: TABLE,
          Key: {
            id: { S: id },
          },
        })
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "Deleted", id }),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: "Not Found" }),
    };
  } catch (err) {
    console.error(err);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Server error", error: err.message }),
    };
  }
};

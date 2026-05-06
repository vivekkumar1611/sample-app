import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";

const db = new DynamoDBClient({ region: "eu-north-1" });

const TABLE = "users";

export const handler = async (event) => {
  const method = event.requestContext.http.method;
  const path = event.rawPath;

  // CREATE USER
  if (method === "POST" && path === "/users") {
    const body = JSON.parse(event.body);

    await db.send(
      new PutItemCommand({
        TableName: TABLE,
        Item: {
          id: { S: Date.now().toString() },
          name: { S: body.name },
          email: { S: body.email },
        },
      })
    );

    return response({ message: "User created" });
  }

  // GET USERS
  if (method === "GET" && path === "/users") {
    const data = await db.send(
      new ScanCommand({ TableName: TABLE })
    );

    return response(
      data.Items.map((i) => ({
        id: i.id.S,
        name: i.name.S,
        email: i.email.S,
      }))
    );
  }

  // DELETE USER
  if (method === "DELETE" && path.startsWith("/users/")) {
    const id = path.split("/")[2];

    await db.send(
      new DeleteItemCommand({
        TableName: TABLE,
        Key: { id: { S: id } },
      })
    );

    return response({ message: "Deleted" });
  }

  return response({ message: "Not Found" }, 404);
};

const response = (body, statusCode = 200) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
  },
  body: JSON.stringify(body),
});

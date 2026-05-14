import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const uri = process.env.DB_MONGO_URL as string;
    if (!uri) throw new Error("Missing DB_MONGO_URL");
    const client = await MongoClient.connect(uri);
    const db = client.db("social_dashboard");

    const updateQuery: any = {};

    if (body.action === "like") {
      updateQuery.$inc = { likes: 1 };
    } else if (body.action === "comment" && body.comment) {
      updateQuery.$push = { comments: body.comment };
    } else {
      await client.close();
      return NextResponse.json(
        { error: "Invalid action payload" },
        { status: 400 }
      );
    }

    const collection = db.collection("posts");
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      updateQuery
    );

    await client.close();

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

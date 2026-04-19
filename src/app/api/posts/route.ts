import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    const uri = process.env.DB_MONGO_URL as string;
    if (!uri) throw new Error("Missing DB_MONGO_URL");
    const client = await MongoClient.connect(uri);
    const db = client.db('social_dashboard');
    
    // Fetch total document count and the paginated list of posts
    const collection = db.collection('posts');
    const totalPosts = await collection.countDocuments();
    const posts = await collection.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray();
    
    await client.close();

    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        total: totalPosts,
        page,
        limit,
        totalPages: Math.ceil(totalPosts / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

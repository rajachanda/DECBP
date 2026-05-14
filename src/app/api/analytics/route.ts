import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const postId = searchParams.get('postId');

    const uri = process.env.DB_MONGO_URL as string;
    if (!uri) throw new Error("Missing DB_MONGO_URL");
    const client = await MongoClient.connect(uri);
    const db = client.db('social_dashboard');
    
    const pipeline: any[] = [];
    
    const matchStage: any = {};
    if (userId && userId !== 'all') {
       matchStage.userId = userId;
    }
    if (postId && postId !== 'all') {
       matchStage._id = new ObjectId(postId);
    }
    if (Object.keys(matchStage).length > 0) {
       pipeline.push({ $match: matchStage });
    }

    pipeline.push(
      {
        $group: {
          _id: '$platform',
          totalLikes: { $sum: '$likes' },
          totalShares: { $sum: '$shares' },
          totalComments: { $sum: { $size: { $ifNull: ['$comments', []] } } },
          postCount: { $sum: 1 }
        }
      },
      {
        $sort: { postCount: -1 }
      }
    );

    const aggregatedData = await db.collection('posts').aggregate(pipeline).toArray();
    await client.close();

    return NextResponse.json({
      success: true,
      data: aggregatedData
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

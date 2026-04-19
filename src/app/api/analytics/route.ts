import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET() {
  try {
    const uri = process.env.DB_MONGO_URL as string;
    if (!uri) throw new Error("Missing DB_MONGO_URL");
    const client = await MongoClient.connect(uri);
    const db = client.db('social_dashboard');
    
    // Aggregation pipeline to get insightful data from nested posts
    const pipeline = [
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
    ];

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

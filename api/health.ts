export default function handler(req: any, res: any) {
  res.setHeader("Content-Type", "application/json");
  res.status(200).json({
    status: "healthy",
    brand: "Yatrik India",
    timestamp: Date.now(),
    platform: "Vercel Serverless",
  });
}

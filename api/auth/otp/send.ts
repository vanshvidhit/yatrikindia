export default function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const phone = req.body?.phone || "";
  if (!phone) {
    return res.status(400).json({ error: "Phone number is required" });
  }

  return res.status(200).json({
    success: true,
    message: `OTP sent successfully to ${phone}`,
    mockOtp: "4821",
    brand: "Yatrik India",
  });
}

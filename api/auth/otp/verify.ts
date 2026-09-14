export default function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { phone, otp, role, name } = req.body || {};
  if (otp !== "4821" && otp !== "1234" && otp !== "0000") {
    return res.status(400).json({ error: "Invalid OTP code. Try 4821." });
  }

  const userId = `${role === "driver" ? "DRV" : "RDR"}-${Date.now().toString().slice(-4)}`;
  const token = `jwt_mock_${userId}_${Date.now()}`;

  const user = {
    id: userId,
    phone: phone || "+91 98765 43210",
    name: name || (role === "driver" ? "Captain Pilot" : "Yatrik Passenger"),
    role: role || "rider",
    rating: 4.95,
  };

  return res.status(200).json({
    success: true,
    token,
    user,
  });
}

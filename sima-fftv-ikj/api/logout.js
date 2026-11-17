export default async function handler(req, res) {
  res.setHeader('Set-Cookie', 'sima_token=; HttpOnly; Path=/; Max-Age=0');
  return res.status(200).json({ success: true });
}
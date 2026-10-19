import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import db from './src/config/db.js';

const port = Number(process.env.PORT || 3000);
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('Konfigurasi tidak aman: isi JWT_SECRET di .env dengan string acak minimal 32 karakter.');
  process.exit(1);
}
const server = app.listen(port, () => console.log(`SuaraKita API berjalan di http://localhost:${port}`));
function shutdown() {
  server.close(() => { db.close(); process.exit(0); });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

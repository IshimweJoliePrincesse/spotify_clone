import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log("PostgreSQL Connected");
    client.release();
  } catch (error) {
    console.error("Error connecting to PostgreSQL:", error.message);
    process.exit(1);
  }
};

// Handle pool errors
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

// Handle application termination
process.on("SIGINT", async () => {
  await pool.end();
  process.exit(0);
});

export { pool };
export default connectDB;

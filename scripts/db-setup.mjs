import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Load .env.local if present, else .env
const envLocalPath = path.resolve(process.cwd(), ".env.local");
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const {
  DB_HOST,
  DB_PORT = 3306,
  DB_NAME = "u725346955_hyskilled",
  DB_USER = "u725346955_hyskilled",
  DB_PASSWORD,
} = process.env;

if (!DB_HOST) {
  console.error("❌ DB_HOST is missing in .env.local. Please set your Remote MySQL host first.");
  process.exit(1);
}

async function run() {
  console.log(`🔌 Connecting to MySQL at ${DB_HOST}:${DB_PORT} as ${DB_USER}...`);
  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    multipleStatements: true,
  });

  console.log(`✅ Connected to database: ${DB_NAME}`);

  const schemaPath = path.resolve(process.cwd(), "db", "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");

  console.log("🛠️ Applying schema (CREATE TABLE IF NOT EXISTS)...");
  await connection.query(schemaSql);
  console.log("✅ Schema applied successfully!");

  console.log("🌱 Checking and seeding catalog tables...");
  
  // Dynamic import of current mock data
  const { categories: mockCategories } = await import("../src/data/categories.js");
  const { instructors: mockInstructors } = await import("../src/data/instructors.js");
  const { courses: mockCourses } = await import("../src/data/courses.js");
  const { bundles: mockBundles } = await import("../src/data/bundles.js");


  // 1. Categories
  const [catCount] = await connection.query("SELECT COUNT(*) as count FROM categories");
  if (catCount[0].count === 0) {

    // 1. Categories
    for (let i = 0; i < mockCategories.length; i++) {
      const c = mockCategories[i];
      await connection.execute(
        `INSERT IGNORE INTO categories (slug, name, short_name, icon, description, hue, keywords, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [c.slug, c.name, c.short, c.icon, c.description, c.hue, JSON.stringify(c.keywords || []), i]
      );
    }
    console.log(`  ✓ Inserted ${mockCategories.length} categories`);
  }

  // 2. Instructors
  for (const inst of mockInstructors) {
    await connection.execute(
      `INSERT IGNORE INTO instructors (id, name, title, bio, rating, learners)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [inst.id, inst.name, inst.title, inst.bio, inst.rating, inst.learners]
    );
  }
  console.log(`  ✓ Inserted/checked instructors`);

  // Get category id map
  const [catRows] = await connection.query("SELECT id, slug FROM categories");
  const catMap = new Map(catRows.map((r) => [r.slug, r.id]));

  // 3. Courses
  for (const c of mockCourses) {
    const catId = catMap.get(c.categorySlug);
    if (!catId) continue;

    await connection.execute(
      `INSERT IGNORE INTO courses (
        slug, title, subtitle, category_id, instructor_id, level, duration_hours,
        price, original_price, rating, review_count, learners, badge, tags,
        short_description, description, outcomes, requirements, audience, modules, status, app_course_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?)`,
      [
        c.slug ?? null,
        c.title ?? null,
        c.subtitle ?? null,
        catId ?? null,
        c.instructorId ?? null,
        c.level ?? "Beginner",
        c.durationHours ?? 0,
        c.price ?? 0,
        c.originalPrice ?? null,
        c.rating ?? 0,
        c.reviewCount ?? 0,
        c.learners ?? 0,
        c.badge ?? null,
        JSON.stringify(c.tags || []),
        c.shortDescription ?? null,
        c.description ?? null,
        JSON.stringify(c.outcomes || []),
        JSON.stringify(c.requirements || []),
        JSON.stringify(c.audience || []),
        JSON.stringify(c.modules || []),
        c.slug ?? null,
      ]
    );
  }
  console.log(`  ✓ Inserted/checked courses`);

  // 4. Bundles
  const [courseRows] = await connection.query("SELECT id, slug FROM courses");
  const courseMap = new Map(courseRows.map((r) => [r.slug, r.id]));

  for (let i = 0; i < mockBundles.length; i++) {
    const b = mockBundles[i];
    const [res] = await connection.execute(
      `INSERT IGNORE INTO bundles (slug, name, tagline, description, price, highlight, status, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, 'published', ?)`,
      [b.slug, b.name, b.tagline, b.description, b.price, b.highlight ? 1 : 0, i]
    );

    let bundleId = res.insertId;
    if (!bundleId) {
      const [existing] = await connection.query("SELECT id FROM bundles WHERE slug = ?", [b.slug]);
      bundleId = existing[0]?.id;
    }

    if (bundleId && Array.isArray(b.courseSlugs)) {
      for (let j = 0; j < b.courseSlugs.length; j++) {
        const cId = courseMap.get(b.courseSlugs[j]);
        if (cId) {
          await connection.execute(
            `INSERT IGNORE INTO bundle_courses (bundle_id, course_id, sort_order) VALUES (?, ?, ?)`,
            [bundleId, cId, j]
          );
        }
      }
    }
  }
  console.log(`  ✓ Inserted/checked bundles`);


  await connection.end();
  console.log("🎉 Database setup complete!");
}

run().catch((err) => {
  console.error("❌ Database setup failed:", err);
  process.exit(1);
});

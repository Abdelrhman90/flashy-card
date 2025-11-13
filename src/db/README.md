# Database Setup with Drizzle ORM

This project uses [Drizzle ORM](https://orm.drizzle.team/) with a [Neon](https://neon.tech/) PostgreSQL database.

## 📁 File Structure

```
src/
  db/
    ├── index.ts       # Database connection
    ├── schema.ts      # Database schema definitions
    ├── example.ts     # Example CRUD operations
    └── README.md      # This file
drizzle/              # Migration files (auto-generated)
drizzle.config.ts     # Drizzle Kit configuration
.env                  # Environment variables (you need to create this)
```

## 🚀 Getting Started

### 1. Create Environment File

Create a `.env` file in the project root with your database connection string:

```env
DATABASE_URL=postgresql://neondb_owner:npg_v7s4aHzIuVyA@ep-sweet-bar-abtims94-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

⚠️ **Important:** Never commit your `.env` file to version control!

### 2. Push Schema to Database

To sync your schema with the database without generating migration files:

```bash
npm run db:push
```

### 3. Generate Migrations (Alternative)

If you prefer to use migration files:

```bash
# Generate migration files
npm run db:generate

# Apply migrations to database
npm run db:migrate
```

### 4. Open Drizzle Studio

To visually explore and manage your database:

```bash
npm run db:studio
```

## 📝 Using the Database

### Import the database client

```typescript
import { db } from '@/db';
import { usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
```

### Create (Insert)

```typescript
await db.insert(usersTable).values({
  name: 'John Doe',
  age: 30,
  email: 'john@example.com',
});
```

### Read (Select)

```typescript
// Get all users
const users = await db.select().from(usersTable);

// Get specific user
const user = await db
  .select()
  .from(usersTable)
  .where(eq(usersTable.email, 'john@example.com'));
```

### Update

```typescript
await db
  .update(usersTable)
  .set({ age: 31 })
  .where(eq(usersTable.email, 'john@example.com'));
```

### Delete

```typescript
await db
  .delete(usersTable)
  .where(eq(usersTable.email, 'john@example.com'));
```

## 🧪 Testing the Setup

Run the example file to test your database connection:

```bash
npx tsx src/db/example.ts
```

## 📚 Available Scripts

- `npm run db:generate` - Generate migration files from schema
- `npm run db:migrate` - Apply migrations to database
- `npm run db:push` - Push schema changes directly to database (no migration files)
- `npm run db:studio` - Open Drizzle Studio (visual database manager)

## 🔧 Defining New Tables

Edit `src/db/schema.ts` to add new tables:

```typescript
import { integer, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

export const postsTable = pgTable("posts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  content: varchar({ length: 1000 }),
  createdAt: timestamp().defaultNow().notNull(),
});
```

Then run `npm run db:push` to sync the changes with your database.

## 📖 Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Drizzle with Neon Guide](https://orm.drizzle.team/docs/get-started/neon-new)
- [Neon Documentation](https://neon.tech/docs/introduction)


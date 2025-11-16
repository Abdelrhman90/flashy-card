import { integer, pgTable, varchar, timestamp, text } from "drizzle-orm/pg-core";

// Decks table - users can create multiple decks
export const decksTable = pgTable("decks", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id", { length: 255 }).notNull(), // Clerk user ID
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Cards table - each deck has multiple cards
export const cardsTable = pgTable("cards", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  deckId: integer("deck_id").notNull().references(() => decksTable.id, { onDelete: "cascade" }),
  front: text().notNull(), // Front of the card (e.g., "Dog" or "When was the battle of hastings?")
  back: text().notNull(), // Back of the card (e.g., "Anjing" or "1066")
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});


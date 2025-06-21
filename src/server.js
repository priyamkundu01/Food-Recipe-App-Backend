import express from "express";
import { ENV } from "./config/env.js";
import { db } from "./config/db.js";
import { favouritesTable } from "./db/schema.js";
import { and, eq } from "drizzle-orm";

const app = express();
const PORT = ENV.PORT || 5001;

// middleware
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true });
})

app.post('/api/favourites', async (req, res) => {
  try {
    // req body
    const { userId, recipeId, title, image, cooktime, servings } = req.body;

    // body check
    if (!title || !userId || !recipeId) {
      res.status(200).json({ error: 'Missing required fields!' });
    }

    // insert values in db table named favouritesTable
    const newFavourite = await db.insert(favouritesTable).values({
      userId, recipeId, title, image, cooktime, servings,
    }).returning();

    // after insertion db response
    res.status(201).json(newFavourite[0]);

  } catch (error) {
    console.log('Error adding favourite', error);
    res.status(500).json({ error: 'Something went wrong!' });
  }
})

app.delete('/api/favourites/:userId/:recipeId', async (req, res) => {
  try {
    const { userId, recipeId } = req.params;

    await db.delete(favouritesTable).where(
      and(eq(favouritesTable.userId, userId), eq(favouritesTable.recipeId, parseInt(recipeId)))
    )

    res.status(200).json({ message: 'Favourite removed successfully!' });
  } catch (error) {
    console.log('Error removing a favourite', error);
    res.status(500).json({ error: 'Something went wrong!' });
  }
})

app.get('/api/favourites/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const userFavourites = await db.select().from(favouritesTable).where(eq(favouritesTable.userId, userId));

    res.status(201).json(userFavourites);

  } catch (error) {
    console.log('Error fetching favourites', error);
    res.status(500).json({ error: 'Something went wrong!' });
  }
})

app.listen(PORT, () => {
  console.log('Server is running on -', PORT);
})
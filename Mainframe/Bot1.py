import asyncio

import discord
from discord.ext import commands
from config import TOKEN
import aiosqlite
import random

intents = discord.Intents.all()

bot = commands.Bot(command_prefix='!',intents=intents)

@bot.event
async def on_ready():
    print("Bot up!")
    setattr(bot, "db", await aiosqlite.connect("level.db"))
    await asyncio.sleep(3)
    async with bot.db.cursor() as cursor:
        await cursor.execute("CREATE TABLE IF NOT EXISTS levels (level INTEGER, xp INTEGER, user INTEGER, guild INTEGER)")

bot.run(TOKEN)
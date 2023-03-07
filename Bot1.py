import discord
from discord.ext import commands

intents = discord.Intents.all()


bot = commands.Bot(command_prefix='!',intents=intents)

@bot.command()
async def skill_issue(ctx):
    await ctx.send('potg')

bot.run('MTA4MjMzNjUzMTUzNDA2OTkwMA.Gc-ys3.TabzpPUIOl9F40IkyQQ0AWJTQ3p0w-Q_t3CDqg')

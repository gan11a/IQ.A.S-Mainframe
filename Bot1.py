import discord
from discord.ext import commands

intents = discord.Intents.all()


bot = commands.Bot(command_prefix='!',intents=intents)

@bot.command()
async def skill_issue(ctx):
    await ctx.send('potg')

bot.run('MTA4MjMzNjUzMTUzNDA2OTkwMA.G-K3qr.l3cvL0Zhyy_SXMAmVvTfI7Yo-kpYqP8fOLqZIY')

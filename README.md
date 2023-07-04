# melvor-grand-exchange-backend

Hello.
It may be exciting to get here and start setting stuff up, but let's take time to make sure we understand what we get ourselves into.

This server must be hosted, requires nginx(or other reverse proxy solution), and certs for https. The default port is 3000 so you'd want to `proxy_pass http://localhost:3000;`, etc.

Letsencrypt may be your best solution for free certs.

I'll see about making a guide for all of this later.

Another(easier) option you may find useful is using Ngrok. This is the solution I'll be using for my testing / proof of concept server.

I'm unsure how much damage the free tier can take given requests, so i'd keep your groups small for now.



I hope to have a guide/etc. up and running before the end of the month(sooner rather than later). Mostly concerned with getting testing in and getting MVP done before the contest(tomorrow as of writing lol)


https://www.vultr.com/?ref=9252619-8H if you'd like to use my referral code for a place to host. I do not this there, but I do for my discord bots.

Update. So I've been wrestling with getting the built files working all morning. Just going to release the source here. While that's cool, it's also annoying because you're going to now need node and to install a black holes worth of node modules until I can get the build flow working correctly.

Sorry.

TLDR, https://ngrok.com/ free tier to start playing with hosting your own server.

1. Download release files from the right
2. Install node 18+
3. install pnpm (npm may work, untested)
4. pnpm/npm install in root folder
5. install ngrok
6. run `pnpm/npm run generate`
7. run `pnpm/npm run dev`
8. run ngrok `ngrok http 3000`
9. Share the provided *HTTPS* ngrok link with YOUR FRIENDS ONLY. I highly advise you play with people you actually know.

Toss a coffee to your coder! https://ko-fi.com/noita

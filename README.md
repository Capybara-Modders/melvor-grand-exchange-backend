# melvor-grand-exchange-backend

Hello.
It may be exciting to get here and start setting stuff up, but let's take time to make sure we understand what we get ourselves into.

This server must be hosted, requires nginx(or other reverse proxy solution), and certs for https. The default port is 3000 so you'd want to proxy_pass to http://localhost:3000, etc.

Letsencrypt may be your best solution for free certs.

I'll see about making a guide for all of this later.

Another(easier) option you may find useful is using Ngrok. This is the solution I'll be using for my testing / proof of concept server.

I'm unsure how much damage the free tier can take given requests, so i'd keep your groups small for now.



I hope to have a guide/etc. up and running before the end of the month(sooner rather than later). Mostly concerned with getting testing in and getting MVP done before the contest(tomorrow as of writing lol)

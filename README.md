# melvor-grand-exchange-backend

Hello.
It may be exciting to get here and start setting stuff up, but let's take time to make sure we understand what we get ourselves into.

This server must be hosted, requires nginx(or other reverse proxy solution), and certs for https. The default port is 3000 so you'd want to `proxy_pass http://localhost:3000;`, etc.

Letsencrypt may be your best solution for free certs.

I'll see about making a guide for all of this later.

Another(easier) option you may find useful is using Ngrok. This is the solution I'll be using for my testing / proof of concept server.

I'm unsure how much damage the free tier can take given requests, so i'd keep your groups small for now.

https://www.vultr.com/?ref=9252619-8H if you'd like to use my referral code for a place to host. I do not this there, but I do for my discord bots.

TLDR, https://ngrok.com/ free tier to start playing with hosting your own server.

1. Install nodejs 20.3.1
2. download and extract respective .zip file from this release
3. In the extracted folder with terminal/commandline/etc. run node index.js prod
4. If you're not running an nginx/etc. server, run ngrok for simple https tunnels
5. provide the https url to your friends
6. enjoy!

Toss a coffee to your coder! https://ko-fi.com/noita

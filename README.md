# catchthemall
A prototype Telegram Pokemon scanner bot with lots of room for improvement (Too many hardcode).

The bot polls sgpokemap.com every minute(hardcoded) and alerts if rare pokemon appears.

Create Telegram Bot
https://core.telegram.org/bots#3-how-do-i-create-a-bot

##Commands
|Commands|Description|
|---:|---:|
|/ping   | check service status|
|/start  | start 1 min poll interval|
|/stop   | stop interval|
|/location :lat :lon   | set scan location|
|/setRange :range | set the scan range in metres|
|/fav :place | list of hardcoded favourite location|
|/list |list of pokemon that we are interested [hardcoded]|
|/add :id |add interested pokemon|
|/delete :id |delete pokemon from the list of interest|



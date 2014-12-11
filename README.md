Tripster
========================
CIS-550 Databases Project. Implement a travel based social network website.

Technologies
------------------------
MySQL and stuff.


Set Up
------------------------
Run `npm install` in the root directory of the project. You need to run with admin
permissions (if it fails). It is suggested that you use sudo: `sudo npm install`.

Set up the config file. There is a sample config file given, you can copy that for 
the base of the config file. Change the `user` and `password` part of the db in
`config.js` to appropriate values.

Start the Redis nosql cache. This can be done by running `redis-server` on the 
current machine or reconfiguring the redis section of config and running redis
remotely.

Start the web application by `node index` or `node index.js`.

DDL
-------------------------
The ddl is in `jobs/`

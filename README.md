# Cantariello

This source code is part of a popular game with the sole purpose of deciding _who is gonna pay the coffee_

To run locally:
- install mongodb
```commandline
sudo apt update
sudo apt install -y mongodb
```
- install node.js and npm
```commandline
sudo apt install nodejs
sudo apt install npm
```
Please make sure that nodejs is install at the current latest lts release (at the moment `8.12.0`)
Now the environment is set: few more steps to go
Install git and clone the repository
```commandline
sudo apt-get install git-core
git clone https://github.com/gorgia/cantariello
```
go to the folder and then install the nodejs modules
```commandline
npm install
```
after some downloads you are ready to go!
```commandline
npm run
```
connect to the host via port 3000 and play!

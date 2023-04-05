## Goal
The goal is to implement a game with two independent units – the players –
communicating with each other using an API.

## Description
When a player starts, it incepts a random (whole) number and sends it to the second
player as an approach to starting the game.
The receiving player can now always choose between adding one of {-1, 0, 1} to get
to a number that is divisible by 3. Divide it by three. The resulting whole number is
then sent back to the original sender.
The same rules are applied until one player reaches the number 1 (after the division).
See the example below.

## The architecture
![alt text](https://github.com/Shuhd/game-of-three/blob/main/game-of-three-architecture.png?raw=true)

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## To start the game

- First run the app.
- Then open http://localhost:3000/ in two browsers.
- Now you can start playing.


## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

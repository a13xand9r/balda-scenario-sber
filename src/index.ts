import cors from 'cors'
require('dotenv').config()
import express from 'express'
import { Server } from 'ws'
import { webHookRout } from './routes/webHookRout';
import { Message, PlayingClient, PlayingPair } from './types';

const PORT = process.env.PORT || 5000

const app = express()

app.use(express.json())
app.use(cors())
app.use(webHookRout)
export let requestCount = 0

app.get('/', (_, res) => {
    console.log('request', requestCount++)
    res.status(200).send('Салют приложение')
})

const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`))

const wss = new Server({ server });

let queue: PlayingClient[] = []
let clients = {}
let playingPairs: PlayingPair[] = []


export const checkUsers = () => {

    wss.clients.forEach(client => {

    })
}

const checkIsUserPlaying = (id: string) => {
    let isAlreadyPlaying = false
    playingPairs.forEach(pair => {
        if (pair[0].userId === id || pair[1].userId === id) isAlreadyPlaying = true
    })
    return isAlreadyPlaying
}

const startGame = (player1: PlayingClient, player2: PlayingClient) => {
    player1.ws.send(JSON.stringify({
        type: 'START', payload: {
            opponentName: player2.name, opponentId: player2.userId
        }
    }))
    player2.ws.send(JSON.stringify({
        type: 'START', payload: {
            opponentName: player1.name, opponentId: player1.userId
        }
    }))
    // wss.clients.forEach(client => {
    //     //@ts-ignore
    //     if (client.id === player1.userId) {
    //         client.send(JSON.stringify({ type: 'start', opponentName: player2.name }))
    //     }
    //     //@ts-ignore
    //     if (client.id === player2.userId) {
    //         client.send(JSON.stringify({ type: 'start', opponentName: player1.name }))
    //     }
    // })
}

wss.on('connection', (ws) => {
    console.log('Client connected...');

    ws.on('message', (rawMessage) => {
        const message = JSON.parse(rawMessage.toString()) as Message

        switch (message.type) {
            case 'RANDOM':
                console.log('queue before', queue.map(item => item.name))
                queue = queue.filter(id => id.userId !== message.payload.userId)
                if (!checkIsUserPlaying(message.payload.userId)) {
                    //@ts-ignore
                    ws.id = message.payload.userId
                    //@ts-ignore
                    console.log('ws.id', ws.id)
                    console.log('id:', message.payload.userId)
                    if (queue.length === 0) {
                        queue.push({
                            userId: message.payload.userId,
                            name: message.payload.name,
                            ws: ws,
                        })
                    } else {
                        startGame(queue[0], {
                            userId: message.payload.userId,
                            name: message.payload.name,
                            ws
                        })
                        playingPairs.push([{
                            userId: queue[0].userId, ws: queue[0].ws, name: queue[0].name
                        }, {
                            userId: message.payload.userId, ws, name: message.payload.name
                        }])
                        queue.splice(0, 1)
                    }
                }
                break
            case 'FRIEND':
                break
            default:
                break;
        }
        console.log('queue after', queue.map(item => item.name))
        console.log('playingPairs', playingPairs.length)
    })
    ws.on('close', () => {
        //@ts-ignore
        console.log(`Client disconnected, id: ${ws.id}`)
        //@ts-ignore
        queue = queue.filter(id => id.userId !== ws.id)
        console.log('queue', queue)
    });
});



// setInterval(() => {
//     wss.clients.forEach((client) => {
//         client.send(new Date().toTimeString());
//     });
// }, 1000);
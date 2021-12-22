import cors from 'cors'
require('dotenv').config()
import express from 'express'
import { Server } from 'ws'
import { webHookRout } from './routes/webHookRout';

const PORT = process.env.PORT || 5000;
// const INDEX = '/index.html';

const app = express()

app.use(webHookRout)
app.use(express.json())
app.use(cors())
export let requestCount = 0

app.get('/', (_, res) => {
    console.log('request', requestCount++)
    res.status(200).send('Салют приложение')
})

const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`))

const wss = new Server({ server });

let queue: string[] = []
let clients = {}
let playingPairs: PlayingPair[] = []


export const checkUsers = () => {
    
    wss.clients.forEach(client => {
        
    })
}

const checkIsUserPlaying = (id: string) => {
    let isAlreadyPlaying = false
    playingPairs.forEach(pair => {
        if (pair[0] === id || pair[1] === id) isAlreadyPlaying = true
    })
    return isAlreadyPlaying
}

const startGame = (id1: string, id2: string) => {
    wss.clients.forEach(client => {
        //@ts-ignore
        if (client.id === id1 || client.id === id2){
            client.send(JSON.stringify({type: 'start'}))
        }
    })
}

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.send('Привет привет пользователь')
    ws.on('message', (rawMessage, isBinary) => {
        const message = JSON.parse(rawMessage.toString()) as {type: string, id: string}
        if (message.type === 'id'){
            if(!checkIsUserPlaying(message.id)){
                //@ts-ignore
                ws.id = id
                if (queue.length === 0) {
                    queue.push(message.id)
                }else {
                    startGame(queue[0], message.id)
                    playingPairs.push([queue[0], message.id])
                    queue.splice(0, 1)
                }
            }
        }
        console.log('queue', queue)
        console.log('playingPairs', playingPairs)
    })
    ws.on('close', () => {
        //@ts-ignore
        console.log(`Client disconnected id: ${ws.id}`)
        //@ts-ignore
        queue = queue.filter(id => id !== ws.id)
    });
});



// setInterval(() => {
//     wss.clients.forEach((client) => {
//         client.send(new Date().toTimeString());
//     });
// }, 1000);
type PlayingClient = {
    id: string
    ws: any
}
// type PlayingClient = {[key: string]: WebSocket}
type PlayingPair = [string, string]
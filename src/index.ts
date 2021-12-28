import cors from 'cors'
require('dotenv').config()
import express from 'express'
import { Server } from 'ws'
import { webHookRout } from './routes/webHookRout';
import { getWord, wordsRoute } from './routes/wordsRoute';
import { GetMessage, PlayingClient, PlayingPair, SendMessage } from './types';
import { v4 } from 'uuid'

const PORT = process.env.PORT || 5000

const app = express()

app.use(express.json())
app.use(cors())
app.use(webHookRout)
app.use(wordsRoute)
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
const sendMessageForPair = (playingPair: PlayingPair, message1: SendMessage, message2?: SendMessage) => {
    wss.clients.forEach(client => {
        //@ts-ignore
        if (client.id === playingPair[0].userId){
            client.send(JSON.stringify(message1))
        }
        //@ts-ignore
        if (client.id === playingPair[1].userId){
            client.send(JSON.stringify(message2 ?? message1))
        }
    })
}
const checkIsUserPlaying = (id: string) => {
    let isAlreadyPlaying = false
    playingPairs.forEach(pair => {
        if (pair[0].userId === id || pair[1].userId === id) isAlreadyPlaying = true
    })
    return isAlreadyPlaying
}

const pairDone = (playingPair: PlayingPair) => {
    sendMessageForPair(
        playingPair,
        {
            type: 'FOUND', payload: {
                opponentName: playingPair[1].name, opponentId: playingPair[1].userId, roomId: v4()
            }
        },
        {
            type: 'FOUND', payload: {
                opponentName: playingPair[0].name, opponentId: playingPair[0].userId, roomId: v4()
            }
        }
    )
    // player1.ws.send(JSON.stringify({
    //     type: 'FOUND', payload: {
    //         opponentName: player2.name, opponentId: player2.userId
    //     }
    // } as SendMessage))
    // player2.ws.send(JSON.stringify({
    //     type: 'FOUND', payload: {
    //         opponentName: player1.name, opponentId: player1.userId
    //     }
    // } as SendMessage))
}
const sendStartWord = async (playingPair: PlayingPair, lettersCount: number = 5) => {
    const startWord = await getWord(lettersCount)
    sendMessageForPair(playingPair, {
        type: 'START_WORD',
        payload: {
            startWord
        }
    })
}

const startGame = (playingPair: PlayingPair) => {
    sendMessageForPair(playingPair, {
        type: 'START'
    })
}
const changePlaygroundSize = (playingPair: PlayingPair, size: number) => {
    sendMessageForPair(playingPair, {
        type: 'CHANGE_PLAYGROUND_SIZE',
        payload: {
            size,
            opponentId: ''
        }
    })
}

wss.on('connection', (ws) => {
    console.log('Client connected...');

    ws.on('message', (rawMessage) => {
        const message = JSON.parse(rawMessage.toString()) as GetMessage

        // //@ts-ignore
        // const playingPair = playingPairs.find(pair => pair[0].userId === ws.id || pair[1].userId === ws.id)
        switch (message.type) {
            case 'RANDOM':
                console.log('queue before', queue.map(item => item.name))
                queue = queue.filter(id => id.userId !== message.payload.userId)
                //@ts-ignore
                ws.id = message.payload.userId
                //@ts-ignore
                console.log('ws.id', ws.id)
                if (!checkIsUserPlaying(message.payload.userId)) {
                    if (queue.length === 0) {
                        queue.push({
                            userId: message.payload.userId,
                            name: message.payload.name,
                            ws: ws,
                            isReady: false
                        })
                    } else {
                        const newPair: PlayingPair = [{
                            userId: queue[0].userId, ws: queue[0].ws, name: queue[0].name, isReady: false
                        }, {
                            userId: message.payload.userId, ws, name: message.payload.name, isReady: false
                        }]
                        pairDone(newPair)
                        sendStartWord(newPair)
                        playingPairs.push(newPair)
                        queue.splice(0, 1)
                    }
                }
                break
            case 'READY':
                playingPairs = playingPairs.map(pair => {
                    //@ts-ignore
                    if (pair[0].userId === ws.id){
                        return [{...pair[0], isReady: true}, pair[1]]
                    }
                    //@ts-ignore
                    if (pair[1].userId === ws.id){
                        return [{...pair[1], isReady: true}, pair[0]]
                    }
                    return pair
                })
                //@ts-ignore
                const playingPairReady = playingPairs.find(pair => pair[0].userId === ws.id || pair[1].userId === ws.id)
                console.log(playingPairReady?.map(client => ({name: client.name, isReady: client.isReady})))
                if (playingPairReady && playingPairReady[0].isReady && playingPairReady[1].isReady) {
                    startGame(playingPairReady)
                }
                break
            case 'CHANGE_PLAYGROUND_SIZE':
                //@ts-ignore
                const playingPairPlayGround = playingPairs.find(pair => pair[0].userId === ws.id || pair[1].userId === ws.id)
                if (playingPairPlayGround){
                    changePlaygroundSize(playingPairPlayGround, message.payload.size)
                    sendStartWord(playingPairPlayGround, message.payload.size)
                }
                break
            case 'FRIEND':
                break
            default:
                break;
        }
        console.log('queue after', queue.map(item => item.name))
        // console.log('playingPairs', playingPairs.length)
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
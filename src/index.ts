import cors from 'cors'
require('dotenv').config()
import express from 'express'
import { Server } from 'ws'
import { webHookRout } from './routes/webHookRout';
import { getWord, wordsRoute } from './routes/wordsRoute';
import { CellType, DisconnectTimers, ExtWebSocket, GetMessage, LostMessage, PlayingClient, PlayingPair, SendMessage } from './types';
import { v4 } from 'uuid'
import { getRandomFromArray } from './utils/utils'

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
let disconnectTimers: DisconnectTimers = {}

let lostMessages = [] as LostMessage[]

const sendMessageForPair = (playingPair: PlayingPair, message1: SendMessage, message2?: SendMessage) => {
    let sendClientsId = [] as string[]
    wss.clients.forEach(client => {
        if ((client as any).id === playingPair[0].userId){
            client.send(JSON.stringify(message1))
            sendClientsId.push(playingPair[0].userId)
        }
        if ((client as any).id === playingPair[1].userId){
            client.send(JSON.stringify(message2 ?? message1))
            sendClientsId.push(playingPair[1].userId)
        }
    })
    if (sendClientsId.length === 1){
        if (sendClientsId[0] === playingPair[0].userId){
            lostMessages.push({
                userId: playingPair[1].userId,
                message: message2 ?? message1
            })
        }
        if (sendClientsId[0] === playingPair[1].userId){
            lostMessages.push({
                userId: playingPair[0].userId,
                message: message1
            })
        }
    }
}
const sendMessageForClient = (userId: string, message: SendMessage) => {
    let sendClientsId = [] as string[]
    wss.clients.forEach(client => {
        console.log(`${message.type} client.id`,(client as any).id)
        if ((client as any).id === userId){
            console.log(`send ${message.type} for userId`,userId)
            client.send(JSON.stringify(message))
            sendClientsId.push(userId)
        }
    })
    if (sendClientsId.length === 0) {
        lostMessages.push({
            userId: userId,
            message: message
        })

    }
}
const checkIsUserPlaying = (id: string) => {
    let isAlreadyPlaying = false
    playingPairs.forEach(pair => {
        if (pair[0].userId === id || pair[1].userId === id) isAlreadyPlaying = true
    })
    return isAlreadyPlaying
}
const checkIsUserLostMessage = (id: string) => lostMessages.find(item => item.userId === id)

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
const sendNewCells = (userId: string, cells: CellType[], newWord: string) => {
    sendMessageForClient(userId, {
        type: 'WORD_DONE',
        payload: {
            cells,
            opponentId: '',
            newWord
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
const setCurrentPlayer = (playingPair: PlayingPair) => {
    const currentPlayer = getRandomFromArray([1, 2]) as 1 | 2
    sendMessageForPair(playingPair, {
        type: 'SET_CURRENT_PLAYER',
        payload: {
            currentPlayer: currentPlayer,
            opponentId: ''
        }
    },
    {
        type: 'SET_CURRENT_PLAYER',
        payload: {
            currentPlayer: currentPlayer === 1 ? 2 : 1,
            opponentId: ''
        }
    }
    )
}

const finishGame = (playingPair: PlayingPair) => {
    sendMessageForPair(playingPair, {
        type: 'OPPONENT_DISCONNECTED'
    })
}
const timerDone = (playingPair: PlayingPair) => {
    sendMessageForPair(playingPair, {
        type: 'TIMER_DONE'
    })
}

wss.on('connection', (ws: ExtWebSocket) => {
    console.log('Client connected...')

    ws.on('message', (rawMessage) => {
        const message = JSON.parse(rawMessage.toString()) as GetMessage
        switch (message.type) {
            case 'RANDOM':
                // console.log('queue before', queue.map(item => item.name))
                queue = queue.filter(id => id.userId !== message.payload.userId)
                ws.id = message.payload.userId
                console.log('ws.id', ws.id)
                if (disconnectTimers[ws.id]) clearTimeout(disconnectTimers[ws.id])
                if (!checkIsUserPlaying(message.payload.userId)) {
                    if (queue.length === 0) {
                        queue.push({
                            userId: message.payload.userId,
                            name: message.payload.name,
                            isReady: false
                        })
                    } else {
                        const newPair: PlayingPair = [{
                            userId: queue[0].userId, name: queue[0].name, isReady: false
                        }, {
                            userId: message.payload.userId, name: message.payload.name, isReady: false
                        }]
                        pairDone(newPair)
                        sendStartWord(newPair)
                        playingPairs.push(newPair)
                        queue.splice(0, 1)
                    }
                } else {
                    const lostMessage = checkIsUserLostMessage(message.payload.userId)
                    if (lostMessage){
                        console.log('lost message')
                        sendMessageForClient(lostMessage.userId, lostMessage.message)
                        lostMessages = lostMessages.filter(item => item.userId !== lostMessage.userId)
                    }
                }
                break
            case 'READY':
                playingPairs = playingPairs.map(pair => {
                    if (pair[0].userId === ws.id){
                        return [{...pair[0], isReady: true}, pair[1]]
                    }
                    if (pair[1].userId === ws.id){
                        return [{...pair[1], isReady: true}, pair[0]]
                    }
                    return pair
                })
                const playingPairReady = playingPairs.find(pair => pair[0].userId === ws.id || pair[1].userId === ws.id)
                // console.log(playingPairReady?.map(client => ({name: client.name, isReady: client.isReady})))
                if (playingPairReady){
                    setCurrentPlayer(playingPairReady)
                }
                if (playingPairReady && playingPairReady[0].isReady && playingPairReady[1].isReady) {
                    startGame(playingPairReady)
                }
                break
            case 'CHANGE_PLAYGROUND_SIZE':
                playingPairs = playingPairs.map(pair => {
                    if (pair[0].userId === ws.id || pair[1].userId === ws.id){
                        return [{...pair[0], isReady: false}, {...pair[1], isReady: false}]
                    }
                    return pair
                })
                const playingPairPlayGround = playingPairs.find(pair => pair[0].userId === ws.id || pair[1].userId === ws.id)
                if (playingPairPlayGround){
                    changePlaygroundSize(playingPairPlayGround, message.payload.size)
                    sendStartWord(playingPairPlayGround, message.payload.size)
                }
                break
            case 'WORD_DONE':
                sendNewCells(message.payload.opponentId, message.payload.cells, message.payload.newWord)
                break
            case 'TIMER_DONE':
                const playingPairTimerDone = playingPairs.find(pair => pair[0].userId === ws.id || pair[1].userId === ws.id)
                if (playingPairTimerDone){
                    timerDone(playingPairTimerDone)
                }
                break
            case 'SET_CURRENT_PLAYER':
                const playingPairCurrentPlayer = playingPairs.find(pair => pair[0].userId === ws.id || pair[1].userId === ws.id)
                if (playingPairCurrentPlayer){
                    setCurrentPlayer(playingPairCurrentPlayer)
                }
                break
            case 'FINISH_GAME':
                playingPairs = playingPairs.filter(pair => !(pair[0].userId === ws.id || pair[1].userId === ws.id))
                break
            case 'FRIEND':
                break
            default:
                break;
        }
        // console.log('queue after', queue.map(item => item.name))
        // console.log('playingPairs', playingPairs.length)
    })
    ws.on('close', () => {
        console.log(`Client disconnected, id: ${ws.id}`)
        queue = queue.filter(id => id.userId !== ws.id)
        const finishGamePair = playingPairs.find(pair => pair[0].userId === ws.id || pair[1].userId === ws.id)
        if (finishGamePair){
            disconnectTimers[ws.id as string] = setTimeout(() => {
                finishGame(finishGamePair)
                playingPairs = playingPairs.filter(pair => !(pair[0].userId === ws.id || pair[1].userId === ws.id))
            }, 5000)
        }
        // console.log('queue', queue)
    });
});


// setInterval(() => {
//     wss.clients.forEach((client) => {
//         client.send(new Date().toTimeString());
//     });
// }, 1000);
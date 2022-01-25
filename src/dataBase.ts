import { MongoClient } from 'mongodb'
require('dotenv').config()

const client = new MongoClient(process.env.MONGODB_CLIENT ?? '')
let scoreDB: any
let isMongoConnected = false
export const start = async () => {
    console.log('MongoDB trying connect')
    try {
        await client.connect()
        isMongoConnected = true
        console.log('MongoDB connected')
        scoreDB = client.db().collection('score')
    } catch (err) {
        console.log(err)
    }
}

const emptyScore: UserScore = {
    userId: '',
    defeatCount: 0,
    drawCount: 0,
    victoryCount: 0,
    score: 0,
    opponents: []
}

export const getUserScore = async (userId: string): Promise<UserScore> => {
    try {
        if (!isMongoConnected) {
            await client.connect()
            scoreDB = client.db().collection('score')
        }
        const user = await scoreDB.findOne({ userId })
        if (user) {
            console.log('user', user)
            return user
        } else {
            return {...emptyScore, userId}
        }
    } catch (err) {
        console.log('mongoDB get score error: ', err)
        return {...emptyScore, userId}
    }
}

export const incrementUserScore = async ({
    userId,
    gameStatus,
    scoreIncrement,
    opponent
}: IncrementScoreArguments

): Promise<UserScore> => {
    try {
        if (!isMongoConnected) {
            await client.connect()
            scoreDB = client.db().collection('score')
        }
        const user = await scoreDB.findOne({ userId })
        if (user) {
            await scoreDB.updateOne({ userId }, {
                $set: {
                    userId,
                    victoryCount: gameStatus === 'Победа' ? user.victoryCount + 1 : user.victoryCount,
                    defeatCount: gameStatus === 'Поражение' ? user.defeatCount + 1 : user.defeatCount,
                    drawCount: gameStatus === 'Ничья' ? user.drawCount + 1 : user.drawCount,
                    score: user.score + scoreIncrement,
                    opponents: [...user.opponents, opponent]
                }
            })
        } else {
            await scoreDB.insertOne({
                userId,
                victoryCount: gameStatus === 'Победа' ? 1 : 0,
                defeatCount: gameStatus === 'Поражение' ? 1 : 0,
                drawCount: gameStatus === 'Ничья' ? 1 : 0,
                score: scoreIncrement,
                opponents: [opponent]
            })
        }
        return await scoreDB.findOne({ userId })
    } catch (err) {
        console.log('mongoDB get score error: ', err)
        return {...emptyScore, userId}
    }
}


export type GameStatus = 'Победа' | 'Поражение' | 'Ничья'
export type Opponent = {
    name: string
    scoreIncrement: number
    gameStatus: GameStatus
}
export type IncrementScoreArguments = {
    userId: string,
    gameStatus: GameStatus,
    scoreIncrement: number,
    opponent: Opponent
}

export type UserScore = {
    userId: string
    victoryCount: number
    defeatCount: number
    drawCount: number
    score: number
    opponents: Opponent[]
}
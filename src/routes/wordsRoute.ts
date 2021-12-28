import { Router } from 'express'
import axios from 'axios';

export const wordsRoute = Router()

export const getWord = async (lettersCount: number) => {
    const { data: { result } } = await axios.get<WordsResponseType>(`https://shlyapa-game.ru/api/v1/words?complexity=low&language=rus&limit=${500}&offset=0&rand=true&randomSeed=${Date.now()}&fields=[%22value%22]`)
    const words = result.data.map(item => item.value)
    for (let i = 0; i < words.length; i++) {
        if (words[i].length === lettersCount){
            return words[i]
        }
    }
    switch (lettersCount) {
        case 3:
            return 'лук'
        case 4:
            return 'блог'
        case 5:
            return 'спина'
        case 6:
            return 'кактус'
        case 7:
            return 'нарцисс'
        case 8:
            return 'подтяжки'
        case 9:
            return 'федерация'
        case 10:
            return 'заключение'
        case 11:
            return 'знаменитость'
        default:
            return 'знаменитость'
    }
}

wordsRoute.get('/word', async (req, res) => {
    const {lettersCount} = req.query as {lettersCount: string}
    res.status(200).json(await getWord(Number(lettersCount)))
})

type WordsResponseType = {
    result: {
        total: number
        data: {value: string}[]
    }
}
import { ScenarioHandler, ActionType } from './types';
import * as dictionary from './system.i18n'
import { capitalizeFirstLetter } from './utils/utils';
require('dotenv').config()

export const runAppHandler: ScenarioHandler = ({ req, res }) => {
    const keyset = req.i18n(dictionary)
    const responseText = keyset('Привет')
    res.appendBubble(responseText)
    res.setPronounceText(responseText)
}

export const noMatchHandler: ScenarioHandler = async ({ req, res }) => {
    const keyset = req.i18n(dictionary)
    const responseText = keyset('404')
    res.appendBubble(responseText)
    res.setPronounceText(responseText)
}

export const startAppHandler: ScenarioHandler = async ({ req, res }) => {
    if (req.request.uuid.sub){
        res.appendCommand({
            type: 'SET_USER_ID',
            userId: req.request.uuid.sub
        })
    }
}

export const navigationPlayOfflineHandler: ScenarioHandler = async ({ res }) => {
    console.log('PLAY')
    res.appendCommand<ActionType>({
        type: 'NAVIGATION_PLAY',
    })
}
export const navigationPlayOnlineHandler: ScenarioHandler = async ({ res }) => {
    res.appendCommand<ActionType>({
        type: 'NAVIGATION_PLAY_ONLINE',
    })
}
export const navigationRulesHandler: ScenarioHandler = async ({ res }) => {
    res.appendCommand<ActionType>({
        type: 'NAVIGATION_RULES',
    })
}
export const navigationBackHandler: ScenarioHandler = async ({ res }) => {
    res.appendCommand<ActionType>({
        type: 'NAVIGATION_BACK',
    })
}
export const navigationNextHandler: ScenarioHandler = async ({ req, res }) => {
    console.log('NAVIGATION_NEXT')
    res.appendCommand<ActionType>({
        type: 'NAVIGATION_NEXT'
    })
}
export const understandHandler: ScenarioHandler = async ({ res }) => {
    res.appendCommand<ActionType>({
        type: 'UNDERSTAND',
    })
}
export const wordDoneHandler: ScenarioHandler = async ({ res }) => {
    res.appendCommand<ActionType>({
        type: 'WORD_DONE',
    })
}
export const resetWordHandler: ScenarioHandler = async ({ res }) => {
    res.appendCommand<ActionType>({
        type: 'RESET_WORD',
    })
}
export const readyHandler: ScenarioHandler = async ({ res }) => {
    res.appendCommand<ActionType>({
        type: 'READY',
    })
}
export const currentScoreHandler: ScenarioHandler = async ({ req, res }) => {
    console.log('state', req.state)
    res.setPronounceText(`Текущий счёт: ${req.state?.player1?.name}, ${req.state?.player1?.score}.${req.state?.player2?.name}, ${req.state?.player2?.score}`)
}
export const playgroundSizeHandler: ScenarioHandler = async ({ req, res }) => {
    const size = Number(JSON.parse(req.variables.size as string).size)
    res.appendCommand({
        type: 'SET_PLAYGROUND_SIZE',
        size
    })
}
export const setName1Handler: ScenarioHandler = async ({ req, res }) => {
    const name = capitalizeFirstLetter(req.message.normalized_text.includes('имя NUM_TOKEN игрок')
        ? req.message.human_normalized_text.replace('имя 1 игрок', '').trim()
        : req.message.human_normalized_text.replace('имя', '').trim())
    res.appendCommand({
        type: 'SET_NAME_1',
        name
    })
}
export const setName2Handler: ScenarioHandler = async ({ req, res }) => {
    const name = capitalizeFirstLetter(req.message.human_normalized_text.replace('имя 2 игрок', '').trim())
    res.appendCommand({
        type: 'SET_NAME_2',
        name
    })
}
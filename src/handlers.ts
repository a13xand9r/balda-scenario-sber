import { ScenarioHandler, ActionType } from './types';
import * as dictionary from './system.i18n'
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
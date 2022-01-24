import { ScenarioRequest } from './types';
import { SmartAppBrainRecognizer } from '@salutejs/recognizer-smartapp-brain'
import {
    createIntents,
    createMatchers,
    createSaluteRequest,
    createSaluteResponse,
    createScenarioWalker,
    createSystemScenario,
    createUserScenario,
    NLPRequest,
    NLPResponse,
    SaluteRequest
} from '@salutejs/scenario'
import { SaluteMemoryStorage } from '@salutejs/storage-adapter-memory'
import { noMatchHandler, navigationPlayOnlineHandler, navigationPlayOfflineHandler, navigationRulesHandler, runAppHandler, navigationBackHandler, navigationNextHandler, understandHandler, wordDoneHandler, resetWordHandler, readyHandler, currentScoreHandler, playgroundSizeHandler, setName1Handler, setName2Handler } from './handlers'
import model from './intents.json'
require('dotenv').config()

const storage = new SaluteMemoryStorage()
const intents = createIntents(model.intents)
const { intent, text } = createMatchers<ScenarioRequest, typeof intents>()

const userScenario = createUserScenario<ScenarioRequest>({
    NavigationPlayOffline: {
        match: intent('/Играть вдвоем', {confidence: 0.7}),
        handle: navigationPlayOfflineHandler
    },
    NavigationPlayOnline: {
        match: intent('/Играть онлайн', {confidence: 0.7}),
        handle: navigationPlayOnlineHandler
    },
    NavigationRules: {
        match: intent('/Правила', {confidence: 0.7}),
        handle: navigationRulesHandler
    },
    NavigationMain: {
        match: intent('/На главную', {confidence: 0.7}),
        handle: navigationRulesHandler
    },
    NavigationBack: {
        match: intent('/Назад', {confidence: 0.7}),
        handle: navigationBackHandler
    },
    NavigationNext: {
        match: intent('/Далее', {confidence: 0.7}),
        handle: navigationNextHandler
    },
    Understand: {
        match: intent('/Понятно', {confidence: 0.7}),
        handle: understandHandler
    },
    WordDone: {
        match: intent('/Засчитать слово', {confidence: 0.7}),
        handle: wordDoneHandler
    },
    ResetWord: {
        match: intent('/Сбросить слово', {confidence: 0.7}),
        handle: resetWordHandler
    },
    Ready: {
        match: intent('/Готов', {confidence: 0.7}),
        handle: readyHandler
    },
    PlaygroundSize: {
        match: intent('/Размер поля', {confidence: 0.7}),
        handle: playgroundSizeHandler
    },
    SetName1: {
        match: req => (req.message.normalized_text.includes('имя NUM_TOKEN игрок')
            || req.message.normalized_text.includes('имя'))
        && !req.message.human_normalized_text.includes('имя 2 игрок'),
        handle: setName1Handler
    },
    SetName2: {
        match: req =>
            req.message.normalized_text.includes('имя NUM_TOKEN игрок'),
        handle: setName2Handler
    },
    // CurrentScore: {
    //     match: intent('/Текущий счет', {confidence: 0.7}),
    //     handle: currentScoreHandler
    // },
})

const systemScenario = createSystemScenario({
    RUN_APP: runAppHandler,
    NO_MATCH: noMatchHandler
})

const scenarioWalker = createScenarioWalker({
    recognizer: new SmartAppBrainRecognizer(process.env.SMARTAPP_BRAIN_TOKEN),
    intents,
    systemScenario,
    userScenario
})

export const handleNlpRequest = async (request: NLPRequest): Promise<NLPResponse> => {
    const req = createSaluteRequest(request)
    const res = createSaluteResponse(request)

    const sessionId = request.uuid.userId
    const session = await storage.resolve(sessionId)

    await scenarioWalker({ req, res, session })

    await storage.save({ id: sessionId, session })

    return res.message
}
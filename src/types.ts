import {
    AppState,
    SaluteHandler,
    SaluteRequest,
    SaluteRequestVariable
} from '@salutejs/scenario'
import WebSocket from 'ws'


export interface ScenarioAppState extends AppState {

}

export interface ScenarioIntentsVariables extends SaluteRequestVariable {
    product?: string;
    number?: string;
    ordinal?: string;
    category?: string;
    quantity?: string;
}

export interface ScenarioSession extends Record<string, unknown>{

}

export type ScenarioRequest = SaluteRequest<ScenarioIntentsVariables, ScenarioAppState>
export type ScenarioHandler = SaluteHandler<ScenarioRequest, ScenarioSession>

export type RandomPlayMessage = {
    type: 'RANDOM',
    payload: {
        name: string
        userId: string
    }
}
export type FriendPlayMessage = {
    type: 'FRIEND',
    payload: {
        userId: string
        name: string
        roomId: number
    }
}

export type OpponentFoundMessage = {
    type: 'FOUND',
    payload: {
        opponentName: string
        opponentId: string
        roomId: string
    }
}
export type StartGameMessage = {
    type: 'START',
}
export type ChangePlaygroundSizeMessage = {
    type: 'CHANGE_PLAYGROUND_SIZE',
    payload: {
        opponentId: string
        size: number
    }
}
export type ReadyMessage = {
    type: 'READY'
    payload: {
        opponentId: string
    }
}
export type StartWordMessage = {
    type: 'START_WORD'
    payload: {
        startWord: string
    }
}
export type WordDoneMessage = {
    type: 'WORD_DONE'
    payload: {
        opponentId: string
        cells: CellType[]
        newWord: string
    }
}
export type ChangeCurrentPlayerMessage = {
    type: 'SET_CURRENT_PLAYER'
    payload: {
        opponentId: string
        currentPlayer: 1 | 2
    }
}

export type GetMessage =
    RandomPlayMessage |
    FriendPlayMessage |
    ChangePlaygroundSizeMessage |
    ReadyMessage |
    WordDoneMessage |
    ChangeCurrentPlayerMessage

export type SendMessage =
    OpponentFoundMessage |
    StartGameMessage |
    ChangePlaygroundSizeMessage |
    StartWordMessage |
    WordDoneMessage |
    ChangeCurrentPlayerMessage

export type PlayingClient = {
    userId: string
    ws: WebSocket
    name: string
    isReady: boolean
}
export type PlayingPair = [PlayingClient, PlayingClient]

export type CellType = {
    colored: boolean
    letter: string | null
    isAvailableToPutLetter: boolean
    isInput: boolean
    tempLetter: string | null
}
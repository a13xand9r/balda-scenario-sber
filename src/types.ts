import {
    AppState,
    SaluteHandler,
    SaluteRequest,
    SaluteRequestVariable
} from '@salutejs/scenario'
import WebSocket from 'ws'


export interface ScenarioAppState extends AppState {
    name?: string
    userId?: string
    startWord?: string
    player1?: {
        name: string,
        words: string[],
        score: number
    }
    player2?: {
        name: string,
        words: string[],
        score: number
    }
    currentPlayerNumber?: 1 | 2
    isMultiplayer?: boolean
    isOpponentOnline?: null | boolean
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
export type FinishGameMessage = {
    type: 'FINISH_GAME'
}
export type OpponentDisconnectedMessage = {
    type: 'OPPONENT_DISCONNECTED'
}
export type TimerDoneMessage = {
    type: 'TIMER_DONE'
}

export type GetMessage =
    RandomPlayMessage |
    FriendPlayMessage |
    ChangePlaygroundSizeMessage |
    ReadyMessage |
    WordDoneMessage |
    ChangeCurrentPlayerMessage |
    FinishGameMessage |
    TimerDoneMessage

export type SendMessage =
    OpponentFoundMessage |
    StartGameMessage |
    ChangePlaygroundSizeMessage |
    StartWordMessage |
    WordDoneMessage |
    ChangeCurrentPlayerMessage |
    OpponentDisconnectedMessage |
    TimerDoneMessage

export type PlayingClient = {
    userId: string
    // ws: WebSocket
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

export interface ExtWebSocket extends WebSocket {
    id?: string
}

export type DisconnectTimers = {
    [key: string]: ReturnType<typeof setTimeout>
}

export type ActionType =
    {
        type: 'SET_FIRST_NAME'
        payload: {
            name: string
        }
    } |
    {
        type: 'SET_SECOND_NAME'
        payload: {
            name: string
        }
    } |
    {
        type: 'SET_PLAYGROUND_SIZE'
        payload: {
            size: number
        }
    } |
    {
        type: 'READY'
    } |
    {
        type: 'UNDERSTAND'
    } |
    {
        type: 'RESET_WORD'
    } |
    {
        type: 'WORD_DONE'
    } |
    {
        type: 'NAVIGATION_NEXT'
    } |
    {
        type: 'NAVIGATION_RULES'
    } |
    {
        type: 'NAVIGATION_PLAY'
    } |
    {
        type: 'NAVIGATION_PLAY_ONLINE'
    } |
    {
        type: 'NAVIGATION_GO_MAIN'
    } |
    {
        type: 'NAVIGATION_BACK'
    }
import { test } from '@substrate-system/tapzero'
import { signal } from '@preact/signals'
import { RequestState, type RequestFor } from '../src/index.js'

test('RequestState creates initial state with null data', t => {
    const state = RequestState<string>()
    t.equal(state.pending, false, 'pending should be false')
    t.equal(state.data, null, 'data should be null')
    t.equal(state.error, null, 'error should be null')
})

test('RequestState creates initial state with provided data', t => {
    const initialData = { id: 1, name: 'test' }
    const state = RequestState<typeof initialData>(initialData)
    t.equal(state.pending, false, 'pending should be false')
    t.deepEqual(state.data, initialData, 'data should match initial data')
    t.equal(state.error, null, 'error should be null')
})

test('RequestState.start sets pending to true', t => {
    const req = signal(RequestState<string>())
    RequestState.start(req)
    t.equal(req.value.pending, true, 'pending should be true after start')
    t.equal(req.value.data, null, 'data should remain null')
    t.equal(req.value.error, null, 'error should remain null')
})

test('RequestState.start preserves existing data', t => {
    const req = signal(RequestState<string>('existing data'))
    RequestState.start(req)
    t.equal(req.value.pending, true, 'pending should be true')
    t.equal(req.value.data, 'existing data', 'data should be preserved')
})

test('RequestState.error sets error on the request', t => {
    const req = signal(RequestState<string>())
    const testError = new Error('Test error')
    RequestState.error(req, testError)
    t.equal(req.value.error, testError, 'error should be set')
})

test('RequestState.error preserves pending and data state', t => {
    const req = signal(RequestState<string>('some data'))
    RequestState.start(req)
    const testError = new Error('Request failed')
    RequestState.error(req, testError)
    t.equal(req.value.pending, true, 'pending should remain true')
    t.equal(req.value.data, 'some data', 'data should be preserved')
    t.equal(req.value.error, testError, 'error should be set')
})

test('RequestState.set updates data and clears error', t => {
    const req = signal(RequestState<string>())
    RequestState.set(req, 'new data')
    t.equal(req.value.data, 'new data', 'data should be updated')
    t.equal(req.value.error, null, 'error should be null')
})

test('RequestState.set clears previous error', t => {
    const req = signal(RequestState<string>())
    RequestState.error(req, new Error('Previous error'))
    RequestState.set(req, 'success data')
    t.equal(req.value.data, 'success data', 'data should be set')
    t.equal(req.value.error, null, 'error should be cleared')
})

test('RequestState.set preserves pending state', t => {
    const req = signal(RequestState<string>())
    RequestState.start(req)
    RequestState.set(req, 'response data')
    t.equal(req.value.pending, true, 'pending should remain true')
    t.equal(req.value.data, 'response data', 'data should be set')
})

test('Complete request lifecycle: start -> set', t => {
    const req = signal(RequestState<{ id: number }>())

    // Initial state
    t.equal(req.value.pending, false, 'should start not pending')
    t.equal(req.value.data, null, 'should start with null data')
    t.equal(req.value.error, null, 'should start with null error')

    // Start request
    RequestState.start(req)
    t.equal(req.value.pending, true, 'should be pending after start')

    // Set successful response
    RequestState.set(req, { id: 123 })
    t.deepEqual(req.value.data, { id: 123 }, 'should have response data')
    t.equal(req.value.error, null, 'should have no error')
})

test('Complete request lifecycle: start -> error', t => {
    const req = signal(RequestState<string>())

    // Start request
    RequestState.start(req)
    t.equal(req.value.pending, true, 'should be pending')

    // Set error response
    const error = new Error('Network error')
    RequestState.error(req, error)
    t.equal(req.value.error, error, 'should have error')
    t.equal(req.value.data, null, 'should still have null data')
})

test('Retry scenario: error -> start -> set', t => {
    const req = signal(RequestState<string>())

    // First attempt fails
    RequestState.start(req)
    RequestState.error(req, new Error('First failure'))
    t.ok(req.value.error, 'should have error from first attempt')

    // Retry
    RequestState.start(req)
    t.ok(req.value.error, 'error should still be present after start')

    // Success
    RequestState.set(req, 'success')
    t.equal(req.value.data, 'success', 'should have success data')
    t.equal(req.value.error, null, 'error should be cleared')
})

test('Works with custom error types', t => {
    interface CustomError {
        statusCode: number
        message: string
    }

    const req = signal(RequestState<string, CustomError>())
    const customError: CustomError = {
        statusCode: 404,
        message: 'Not Found'
    }

    RequestState.error(req, customError)
    t.equal(req.value.error?.statusCode, 404,
        'should preserve custom error structure')
    t.equal(req.value.error?.message, 'Not Found',
        'should preserve error message')
})

test('Works with complex data types', t => {
    interface User {
        id: number
        name: string
        metadata: {
            createdAt: string
            tags: string[]
        }
    }

    const req = signal(RequestState<User>())
    const user: User = {
        id: 1,
        name: 'Alice',
        metadata: {
            createdAt: '2024-01-01',
            tags: ['admin', 'verified']
        }
    }

    RequestState.set(req, user)
    t.deepEqual(req.value.data, user, 'should handle complex nested objects')
})

test('Multiple sequential updates', t => {
    const req = signal(RequestState<number>())

    RequestState.set(req, 1)
    t.equal(req.value.data, 1, 'first update')

    RequestState.set(req, 2)
    t.equal(req.value.data, 2, 'second update')

    RequestState.set(req, 3)
    t.equal(req.value.data, 3, 'third update')
})

test('Signal reactivity triggers on state changes', t => {
    const req = signal(RequestState<string>())
    let callCount = 0
    const lastValues: RequestFor<string, Error>[] = []

    // Subscribe to signal changes
    const unsubscribe = req.subscribe(value => {
        callCount++
        lastValues.push(value)
    })

    // Initial subscription fires immediately
    t.equal(callCount, 1, 'should fire on subscription')

    // Trigger changes
    RequestState.start(req)
    t.equal(callCount, 2, 'should fire on start')
    t.equal(lastValues[1]?.pending, true, 'should reflect pending state')

    RequestState.set(req, 'data')
    t.equal(callCount, 3, 'should fire on set')
    t.equal(lastValues[2]?.data, 'data', 'should reflect new data')

    unsubscribe()
})

test('all done', () => {
    // @ts-expect-error tests
    window.testsFinished = true
})

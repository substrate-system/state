import { type HTTPError } from 'ky'
import { type Signal } from '@preact/signals'

export type RequestFor<T, E=Error> = {
    pending:boolean;
    data:null|T;
    error:null|E
}

/**
 * Create initial request state.
 * @returns {RequestFor<T, E>}
 */
export function RequestState<T=any, E=Error> (init?:T):RequestFor<T, E> {
    return { pending: false, data: init || null, error: null }
}

RequestState.start = function<T=any, E=HTTPError> (
    req:Signal<RequestFor<T, E>>
) {
    req.value = { ...req.value, pending: true }
}

RequestState.error = function<T=any, E=HTTPError> (
    req:Signal<RequestFor<T, E>>,
    err:E
) {
    req.value = { ...req.value, pending: false, error: err }
}

RequestState.set = function <T=any, E=HTTPError> (
    req:Signal<RequestFor<T, E>>,
    data:T
) {
    req.value = { pending: false, data, error: null }
}

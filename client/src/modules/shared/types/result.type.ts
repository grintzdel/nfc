type Success<T> = {
  data: T
  error: null
}

type Failure<E> = {
  data: null
  error: E
}

export type ResultType<T, E = Error> = Success<T> | Failure<E>

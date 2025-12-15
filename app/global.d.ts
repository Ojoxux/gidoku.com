import type {} from 'hono'
import type { Env as AppEnv, Variables as AppVariables } from './types/env'

declare module 'hono' {
  interface Env {
    Variables: AppVariables
    Bindings: AppEnv
  }
}

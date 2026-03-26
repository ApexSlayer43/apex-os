// Fix framer-motion ease typing issue with number[] arrays
// This is a known compatibility issue between framer-motion and strict TS
import 'framer-motion'

declare module 'framer-motion' {
  interface Transition {
    ease?: number[] | string | [number, number, number, number]
  }
}

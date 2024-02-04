import React, { version } from 'react'
import ReactDOM from 'react-dom'
import App from './App'

// eslint-disable-next-line no-console
console.log('Parent folder loaded react version: ', version)

ReactDOM.render(<App />, document.getElementById('app'))

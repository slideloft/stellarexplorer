import React, {Component} from 'react'
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'
import PropTypes from 'prop-types'

import {IntlProvider, addLocaleData} from 'react-intl'
import en from 'react-intl/locale-data/en'
import zh from 'react-intl/locale-data/zh'
import enMessages from './languages/en'
import zhMessages from './languages/zh'

import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Home from './components/Home'
import NoMatch from './components/shared/NoMatch'

import Ledger from './components/Ledger'
import Ledgers from './components/Ledgers'
import Transaction from './components/Transaction'
import Transactions from './components/Transactions'
import Account from './components/Account'
import Accounts from './components/Accounts'
import Anchors from './components/Anchors'
import Operations from './components/Operations'

import {networks} from './lib/Stellar'
import {storageInit} from './lib/Utils'

import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

// TODO: revist ipfs deploy .. some routes are failing on ipfs gateway:

// import {ipfsBasepath} from './config.json'
// const routerBasepath = process.env.NODE_ENV === 'production' ? ipfsBasepath : ''
const routerBasepath = ''

const storage = storageInit()

addLocaleData([...en, ...zh])

const initialLanguage =
  storage.getItem('language') || navigator.language || 'en'
const initialNetwork = storage.getItem('network') || 'public'

const getMessages = locale => {
  switch (locale) {
    case 'zh':
      return zhMessages
    default:
      return enMessages
  }
}

const reloadPage = () => window.location.reload(true)

class App extends Component {
  state = {
    language: initialLanguage,
    network: initialNetwork,
    server: networks[initialNetwork].initFunc(),
  }

  languageSwitcher = event => {
    const newLanguage = event.target.lang
    storage.setItem('language', newLanguage)
    this.setState({language: newLanguage}, reloadPage)
  }

  networkSwitcher = selectedNetwork => {
    console.log(`NETWORK change: ${this.state.network} to ${selectedNetwork}`)
    storage.setItem('network', selectedNetwork)
    const server = networks[selectedNetwork].initFunc()
    this.setState(
      {
        network: selectedNetwork,
        server: server,
      },
      reloadPage
    )
  }

  // @see HOCs.js withServer() to get this as props in any component
  getChildContext() {
    return {server: this.state.server}
  }

  render() {
    return (
      <IntlProvider
        key={this.state.language}
        locale={this.state.language}
        messages={getMessages(this.state.language)}
      >
        <Router basename={routerBasepath}>
          <div className="App">
            <Header
              network={this.state.network}
              networkSwitcher={this.networkSwitcher}
              language={this.state.language}
              languageSwitcher={this.languageSwitcher}
            />
            <div id="main-content">
              <Switch>
                <Route exact path="/" component={Home} />
                <Route path="/ledgers" component={Ledgers} />
                <Route path="/ledger/:id" component={Ledger} />
                <Route path="/txs" component={Transactions} />
                <Route path="/tx/:id" component={Transaction} />
                <Route path="/operations" component={Operations} />
                <Route path="/accounts" component={Accounts} />
                <Route path="/account/:id" component={Account} />
                <Route path="/anchors" component={Anchors} />
                <Route path="/error/not-found/:id" component={NoMatch} />
                <Route component={NoMatch} />
              </Switch>
            </div>
            <Footer />
          </div>
        </Router>
      </IntlProvider>
    )
  }
}

App.childContextTypes = {
  server: PropTypes.object,
}

export default App

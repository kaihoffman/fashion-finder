import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route } from 'react-router-dom'
import { createGlobalStyle } from 'styled-components'
import firebase, { db } from '../firebase'

import LookPage from '../LookPage'
import LookInfo from '../LookInfo'
import Basket from '../Basket'
import Checkout from '../CheckoutPage'

const GlobalStyles = createGlobalStyle`
  * {
    text-rendering: auto;
    box-sizing: border-box;
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  ul {
    padding: 0;
  }

  a {
    text-decoration: none;
  }

  .card-text {
    line-height: 1.4;
    margin-top: 20px;
    font-size: 1.1rem;
    padding: 3px;
  }

  .price {
    margin-top: 10px;
    font-size: 1.2rem;
  }

  #app {
    @media only screen and (min-width: 400px) {
      min-height: 100vh;
      display: grid;
      align-items: center;
    }
  }
`

export default class App extends Component {
  state = {
    currentLook: null,
    basket: {},
    looks: [],
  }

  componentDidMount() {
    const looksTable = db.collection('looks')
    looksTable
      .orderBy('id')
      .get()
      .then(snapshot => {
        const looks = []
        snapshot.docs.forEach(doc => {
          const { brands, description, price, image } = doc.data()

          const look = {
            id: doc.id,
            brands,
            description,
            price,
            image,
          }

          looks.push(look)
          looks.sort(function() {
            return 0.5 - Math.random()
          })
        })

        this.setState({ currentLook: looks[0] })
        looks.splice(0, 1)
        this.setState({ looks: looks })
      })
  }

  componentWillUnmount() {
    firebase.app().delete()
  }

  handleClick = () => {
    this.setState({ currentLook: this.state.looks[0] })
    const looks = this.state.looks
    looks.splice(0, 1)
    this.setState({ looks })
  }

  addToBasket = () => {
    const basket = this.state.basket
    basket[this.state.currentLook.id] = this.state.currentLook
    // basket.push(this.state.currentLook)
    this.setState({ basket })
    this.handleClick()
  }

  removeFromBasket = id => {
    const basket = this.state.basket
    delete basket[id]
    this.setState({ basket })
  }

  resetState = () => {
    const basket = {}
    const currentLook = null
    this.setState({ basket, currentLook })
  }

  render() {
    return (
      <BrowserRouter>
        <div>
          <GlobalStyles />
          <Route
            exact={true}
            path="/"
            render={props => (
              <LookPage
                currentLook={this.state.currentLook}
                handleClick={this.handleClick}
                addToBasket={this.addToBasket}
              />
            )}
          />
          <Route path="/lookinfo/:id/" component={LookInfo} />
          <Route
            exact={true}
            path="/lookbook"
            render={props => (
              <Basket
                removeFromBasket={this.removeFromBasket}
                basket={this.state.basket}
              />
            )}
          />

          <Route
            exact={true}
            path="/checkout"
            render={props => <Checkout resetState={this.resetState} />}
          />
        </div>
      </BrowserRouter>
    )
  }
}

import React, { Component } from 'react';
import { render } from 'react-dom';
import './styles/main.scss';

import Scatterplot from './components/Scatterplot';

class App extends Component {
  render() {
    return(
      <div id='main-container'>
        <h1>Doping Scatterplot</h1>
        <Scatterplot />
      </div>
    )
  }
};

render(
  <App />,
  document.getElementById('root')
);
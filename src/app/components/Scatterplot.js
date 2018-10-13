import React, { Component } from 'react';

class Scatterplot extends Component {
  constructor(props) {
    super(props);
    this.state = {
      height: 500,
      width: 1200,
    };
  }
  render() {
    return(
      <svg ref={node => this.node = node} height={this.state.height} width={this.state.width}>
      </svg>
    );
  };
};

export default Scatterplot;
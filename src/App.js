import React, { Component } from 'react';
import _ from 'lodash';
import './App.css';

class App extends Component {
  state = {
    debug: true,
    initialTiles: 2,
    initialTileValue: 2,
    score: 0,
    highestTileScore: 0,
    tiles: [
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
    ],
    gameOver: false,
  };

  updateScore(value) {
    this.setState(prevState => ({
      score: prevState.score += value
    }));
    if (this.state.debug === true) {
      console.log(`add ${value} to score (${this.state.score})`);
    }
  }

  getHighestTileScore() {
    let highestValue = 0;
    this.state.tiles.map((row, rowIndex) => {
      row.map((tile, tileIndex) => {
        if (tile > highestValue) {
          highestValue = tile;
        }
      });
    });
    this.setState(prevState => ({
      highestTileScore: highestValue
    }));
    if (this.state.debug === true) {
      console.log(`update and set ${this.state.highestTileScore} to highest tile value`);
    }
  }

  keyPress(e) {
    if (e.keyCode in eventKeys) {
      this.move(eventKeys[e.keyCode].direction);
    }
  }

  getFreeTiles() {
    let freeTiles = [];
    this.state.tiles.map((row, rowIndex) => {
      row.map((tile, tileIndex) => {
        if (tile === '') {
          freeTiles.push([rowIndex, tileIndex]);
        }
      });
    });

    return freeTiles;
  }

  generateGameTile() {
    let freeTiles = this.getFreeTiles();
    let randomTile = Math.floor((Math.random() * (freeTiles.length)));
    let tmpTiles = this.state.tiles;
    if (freeTiles.length > 0) {
      tmpTiles[freeTiles[randomTile][0]][freeTiles[randomTile][1]] = this.state.initialTileValue;
      this.setState(prevState => ({
        tiles: tmpTiles
      }));
    } else {
      this.setState(prevState => ({
        gameOver: true
      }));
    }
  }

  mergeTiles(direction) {
    let numberOfTilesMoved = 0
    let valuesMerged = 0;

    let tmpTiles = this.state.tiles;

    if (direction === 'left') {
      // for (let row = 0; row <= tmpTiles.length - 1; row++) {
      //   for (let tile = 0; tile <= tmpTiles[row].length - 1; tile++) {
      //   //   if (tmpTiles[row][tile-1] === "") {
      //   //     tmpTiles[row][tile-1] = tile;
      //   //     numberOfTilesMoved++;
      //   //   } else if (tile === tmpTiles[row][tile-1]) {
      //   //     tmpTiles[row][tile-1] *= 2;
      //   //     valuesMerged += tmpTiles[row][tile-1];
      //   //     tmpTiles[row][tile] = "";
      //   //     numberOfTilesMoved++;
      //   //   }
      //   }
      // }
      this.state.tiles.map((row, rowIndex) => {
        row.map((tile, tileIndex) => {
          if (tileIndex > 0) {
            if (tmpTiles[rowIndex][tileIndex-1] === "") {
              tmpTiles[rowIndex][tileIndex-1] = tile;
              numberOfTilesMoved++;
            } else if (tile === tmpTiles[rowIndex][tileIndex-1]) {
              tmpTiles[rowIndex][tileIndex-1] *= 2;
              valuesMerged += tmpTiles[rowIndex][tileIndex-1];
              tmpTiles[rowIndex][tileIndex] = "";
              numberOfTilesMoved++;
            }
          }
        });
      });
    }
    if (direction === 'right') {
      valuesMerged = 2;
    }
    if (direction === 'up') {
      valuesMerged = 3;
    }
    if (direction === 'down') {
      valuesMerged = 4;
    }

    // this.setState(prevState => ({
    //   tiles: tmpTiles
    // }));

    // this.updateScore(valuesMerged);

    return numberOfTilesMoved > 0;
  }

  move(direction) {
    if (this.state.debug === true) {
      console.log(`Move tiles to ${direction}`);
    }
    if (this.mergeTiles(direction)) {
      this.generateGameTile();
      this.getHighestTileScore();
    }
  }

  componentWillMount(){
    if (this.state.debug === true) {
      console.log('mount application');
    }
    document.addEventListener("keydown", this.keyPress.bind(this));
    this.restart();
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.keyPress.bind(this));
  }

  restart = () => {
    let tmpTiles = [
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
    ];
    this.setState(prevState => ({
      score: 0,
      tiles: tmpTiles,
      gameOver: false,
    }));
    _.range(0, this.state.initialTiles).forEach(() => {
      this.generateGameTile();
    });
    this.getHighestTileScore();
  }

  render() {
    let randomButton = <button onClick={() => {this.generateGameTile(1)}}>Slumpa</button>;
    return (
      <div className="app">
        <GameOver restart={this.restart} state={this.state.gameOver} />
        <header>
          <h1>2048 Clone by Björn Wiberg - {this.state.gameOver}</h1>
        </header>
        <Tiles tiles={this.state.tiles} />
        <Scores score={this.state.score} topTileScore={this.state.highestTileScore} />
      </div>
    );
  }
}

class GameOver extends Component {
  getOverlayClass() {
    return (this.props.state ? 'active' : '');
  }
  render() {
    return (
      <div className={`overlay ${this.getOverlayClass()}`}>
        <div className="gameOver">
          <p>Game over {this.props.state}</p>
          <p><button onClick={() => {this.props.restart()}}>Start over</button></p>
        </div>
      </div>
    )
  }
}

class Tiles extends Component {
  tiles() {
      return this.props.tiles.map((rows, rowIndex) => {
          var row = rows.map((tile, columnIndex) => 
            <Tile key={`tile_${rowIndex}${columnIndex}`} index={`${rowIndex},${columnIndex}`} value={this.props.tiles[rowIndex][columnIndex]} />
          ); 
          return <div key={`row_${rowIndex}`} className="row">{row}</div>;
      });
  }
  render() {
    return (
      <div className="tiles">
        {this.tiles()}
      </div>
    );
  }
}
class Tile extends Component {
  render() {
    return (
      <div className={`tile tile-${this.props.value}`}>
        <div className="inner">
          <div className="value">{this.props.value}<br />{this.props.index}</div>
        </div>
      </div>
    );
  }
}

class Scores extends Component {
  render() {
    return (
      <div className="scores">
        Score: {this.props.score}, Top tile score: {this.props.topTileScore}
      </div>
    );
  }
}

export default App;

const eventKeys = {
  // ARROWS
  37: {
    direction: 'left',
  },
  39: {
    direction: 'right',
  },
  38: {
    direction: 'up',
  },
  40: {
    direction: 'down',
  },
  // VIM
  72: { // (H)
    direction: 'left',
  },
  76: { // (L)
    direction: 'right',
  },
  74: { // (J)
    direction: 'down',
  },
  75: { // (K)
    direction: 'up',
  },
  // GAMER
  65: { // (A)
    direction: 'left',
  },
  68: { // (D)
    direction: 'right',
  },
  87: { // (W)
    direction: 'up',
  },
  83: { // (S)
    direction: 'down',
  },
}

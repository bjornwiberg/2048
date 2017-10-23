import React, { Component } from 'react';
import _ from 'lodash';
import rotateMatrix from 'rotate-matrix';
import './App.css';

class App extends Component {
  state = {
    debug: true,
    initialTiles: 2,
    initialTileValue: 2,
    score: 0,
    highestTileScore: 0,
    allowNewTileToGenerate: true,
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
    this.setState(prevState => ({
      highestTileScore: (
        this.state.tiles.reduce(function (max, arr) {
            return max >= Math.max.apply(max, arr) ? max : Math.max.apply(max, arr);
        }, -Infinity)
      )
    }));
    if (this.state.debug === true) {
      console.log(`update and set ${this.state.highestTileScore} to highest tile value`);
    }
  }

  keyPress(e) {
    if (e.keyCode in eventKeys) {
      this.move(eventKeys[e.keyCode]);
    }
  }

  getFreeTiles() {
    let freeTiles = [];
    this.state.tiles.forEach(function(row, rowIndex) {
      row.forEach(function(tile, tileIndex) {
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
    console.log(freeTiles.length, this.state.allowNewTileToGenerate);
    if (freeTiles.length === 0 && !this.state.allowNewTileToGenerate) {
      this.setState(prevState => ({
        gameOver: true
      }));
    } else if (this.state.allowNewTileToGenerate) {
      tmpTiles[freeTiles[randomTile][0]][freeTiles[randomTile][1]] = this.state.initialTileValue;
      this.setState(prevState => ({
        tiles: tmpTiles
      }));
    }
  }

  mergeTiles(rotations) {
    let valuesMerged = 0;

    // stringify state tiles
    let orginalState = JSON.stringify(this.state.tiles);

    // fetch tiles from state into temp array
    let tmpTiles = this.state.tiles;

    // rotate the tile matrix
    if (this.state.debug === true) {
      console.log(`rotate the tile matrix ${rotations} times`);
    }
    tmpTiles = rotateMatrix(tmpTiles, rotations);

    
    // merge tiles with same values and move them to left
    /*
      DO THE MAGIC
    */
    tmpTiles.forEach(function(row, rowIndex) {
      row.forEach(function(tile, tileIndex) {
        if (tile === '') {
          tmpTiles[rowIndex].splice(tileIndex, 1);
          tmpTiles[rowIndex].push("");
        }
      });
    });

    if (this.state.debug === true) {
      console.log(`merge and move tiles`);
    }

    // restore the tile matrix to original state
    if (this.state.debug === true) {
      console.log(`rotate the tile matrix ${rotations} times backwards`);
    }
    tmpTiles = rotateMatrix(tmpTiles, rotations * -1);

    // check if any tiles have been moved
    let anyTilesMoved = JSON.stringify(tmpTiles) !== orginalState;

    this.setState(prevState => ({
      tiles: tmpTiles,
      allowNewTileToGenerate: anyTilesMoved,
    }));


    this.updateScore(valuesMerged);
  }

  move(action) {
    if (this.state.debug === true) {
      console.log(`Move tiles to ${action.direction}`);
    }
    this.mergeTiles(directionRotates[action.direction]);
    this.generateGameTile();
    this.getHighestTileScore();
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
      allowNewTileToGenerate: true,
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
          <h1>2048 Clone by Björn Wiberg</h1>
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
          <div className="value">{this.props.value}</div>
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

const directionRotates = {
  left: 0,
  right: 2,
  up: 3,
  down: 1,
}
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

import React, { Component } from 'react';
import rotateMatrix from 'rotate-matrix';
import './App.css';
import {directionRotates, eventKeys, goalScore} from './Constants';

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
      this.move(eventKeys[e.keyCode].direction);
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
    if (this.state.debug === true) {
      console.log(`merge and move tiles`);
    }
    tmpTiles.forEach(function(row, rowIndex) {
      // filter out non empty tiles
      tmpTiles[rowIndex] = row.filter(tile => tile !== '');
      // iterate each tiles in filtered row
      tmpTiles[rowIndex].forEach((tile, tileIndex) => {
        // if not first tile in row and same value as previous tile in row
        if (tileIndex > 0 && tile === tmpTiles[rowIndex][tileIndex - 1]) {
          // double the value of previous column
          tmpTiles[rowIndex][tileIndex - 1] *= 2;
          // add the updated tiles value to the score counter
          valuesMerged += tmpTiles[rowIndex][tileIndex - 1];
          // remove the tile in current iteration
          tmpTiles[rowIndex].splice(tileIndex, 1);
        }
      })

      // push empty values to array until size matches matrix width
      while (tmpTiles[rowIndex].length < 4) {
        tmpTiles[rowIndex].push('');
      }
    });

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

  move(direction) {
    if (this.state.gameOver !== true
      && this.state.highestTileScore !== goalScore
    ) {
      if (this.state.debug === true) {
        console.log(`Move tiles to ${direction}`);
      }
      this.mergeTiles(directionRotates[direction]);
      this.generateGameTile();
      this.getHighestTileScore();
    }
  }

  componentWillMount(){
    if (this.state.debug === true) {
      console.log('mount application');
    }
    document.addEventListener("keydown", this.keyPress.bind(this));
    this.start();
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.keyPress.bind(this));
  }

  start = () => {
    for (var i = this.state.initialTiles - 1; i >= 0; i--) {
      this.generateGameTile();
    }
    this.getHighestTileScore();
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
    this.start();
  }

  render() {
    return (
      <div className="app">
        <GameOver state={this.state.gameOver} />
        <Win score={this.state.highestTileScore} />
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
        <div className="inner gameOver">
          <p>Game over</p>
        </div>
      </div>
    )
  }
}

class Win extends Component {
  getOverlayClass() {
    return (this.props.score === goalScore ? 'active' : '');
  }
  render() {
    return (
      <div className={`overlay ${this.getOverlayClass()}`}>
        <div className="inner win">
          <p>
            Congratulations,<br />
            you reached {goalScore} and won the game!
          </p>
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

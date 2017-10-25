import React, { Component } from 'react';
import rotateMatrix from 'rotate-matrix';
import './App.css';
import 'font-awesome/css/font-awesome.min.css';
import {directionRotates, eventKeys, goalScore, debugMode} from './Constants';
import Swipeable from 'react-swipeable'

class App extends Component {
  state = {
    initialTiles: 2,
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
    if (debugMode === true) {
      console.log(`add ${value} to score (${this.state.score})`);
    }
  }

  getHighestTileScore() {
    let highestTileScore = (
      this.state.tiles.reduce(function (max, arr) {
          return max >= Math.max.apply(max, arr) ? max : Math.max.apply(max, arr);
      }, -Infinity)
    );
    if (highestTileScore > this.state.highestTileScore) {
      this.setState(prevState => ({
        highestTileScore: (
          this.state.tiles.reduce(function (max, arr) {
              return max >= Math.max.apply(max, arr) ? max : Math.max.apply(max, arr);
          }, -Infinity)
        )
      }));
      if (debugMode === true) {
        console.log(`update and set ${this.state.highestTileScore} to highest tile value`);
      }
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
    if (freeTiles.length === 0 && !this.state.allowNewTileToGenerate) {
      this.setState(prevState => ({
        gameOver: true
      }));
    } else if (this.state.allowNewTileToGenerate) {
      let randomTile = Math.floor((Math.random() * (freeTiles.length)));
      let tmpTiles = this.state.tiles;
      // new tiles should have value 2 or 4
      let tileValue = (1 + Math.floor((Math.random() * 2))) * 2;

      tmpTiles[freeTiles[randomTile][0]][freeTiles[randomTile][1]] = tileValue;
      this.setState(prevState => ({
        tiles: tmpTiles
      }));
    }
  }

  mergeTilesToLeft(matrix) {
    let valuesMerged = 0;

    // merge tiles with same values and move them to left
    /*
      DO THE MAGIC
    */
    if (debugMode === true) {
      console.log(`merge and move tiles`);
    }
    matrix.forEach(function(row, rowIndex) {
      // filter out non empty tiles
      matrix[rowIndex] = row.filter(tile => tile !== '');
      // iterate each tiles in filtered row
      matrix[rowIndex].forEach((tile, tileIndex) => {
        // if not first tile in row and same value as previous tile in row
        if (tileIndex > 0 && tile === matrix[rowIndex][tileIndex - 1]) {
          // double the value of previous column
          matrix[rowIndex][tileIndex - 1] *= 2;
          // add the updated tiles value to the score counter
          valuesMerged += matrix[rowIndex][tileIndex - 1];
          // remove the tile in current iteration
          matrix[rowIndex].splice(tileIndex, 1);
        }
      })

      // push empty values to array until size matches matrix width
      while (matrix[rowIndex].length < 4) {
        matrix[rowIndex].push('');
      }
    });

    return {
      matrix: matrix,
      valuesMerged: valuesMerged,
    };
  }

  mergeTiles(rotations) {
    // stringify state tiles
    let orginalState = JSON.stringify(this.state.tiles);

    // fetch tiles from state into temp array
    let tmpTiles = this.state.tiles;

    // rotate the tile matrix
    if (debugMode === true) {
      console.log(`rotate the tile matrix ${rotations} times`);
    }
    tmpTiles = rotateMatrix(tmpTiles, rotations);

    // merge tiles to left
    let merge = this.mergeTilesToLeft(tmpTiles);

    // restore the tile matrix to original state
    if (debugMode === true) {
      console.log(`rotate the tile matrix ${rotations} times backwards`);
    }
    tmpTiles = rotateMatrix(merge.matrix, rotations * -1);

    // check if any tiles have been moved
    let anyTilesMoved = JSON.stringify(tmpTiles) !== orginalState;

    this.setState(prevState => ({
      tiles: tmpTiles,
      allowNewTileToGenerate: anyTilesMoved,
    }));

    this.updateScore(merge.valuesMerged);
  }

  move(direction) {
    if (this.state.gameOver !== true
      && this.state.highestTileScore !== goalScore
    ) {
      if (debugMode === true) {
        console.log(`Move tiles to ${direction}`);
      }
      this.mergeTiles(directionRotates[direction]);
      this.generateGameTile();
      this.getHighestTileScore();
    }
  }

  componentWillMount(){
    if (debugMode === true) {
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
        <LandscapeHint />
        <GameOver state={this.state.gameOver} />
        <Win score={this.state.highestTileScore} />
        <Header text="2048 Clone by Bj&ouml;rn Wiberg" />
        <Scores score={this.state.score} topTileScore={this.state.highestTileScore} />
        <Swipeable
          onSwipedLeft={() => this.move('left')}
          onSwipedRight={() => this.move('right')}
          onSwipedUp={() => this.move('up')}
          onSwipedDown={() => this.move('down')}
        >
            <Tiles tiles={this.state.tiles} />
        </Swipeable>
        <Bottom />
      </div>
    );
  }
}

class LandscapeHint extends Component {
  render() {
    return (
      <div className="landscapeHint">
        <div className="inner">
          <p>
            Please rotate screen on mobile device<br />
            or<br />
            resize window to be more tall than wide.
          </p>
        </div>
      </div>
    )
  }
}

class Header extends Component {
  render() {
    return (
      <header>
        <h1>{this.props.text} <a href="https://github.com/bjornwiberg/2048" target="_blank" rel="noopener noreferrer" title="Download source code on github"><i className="fa fa-github"></i></a></h1>
      </header>
    )
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

class Bottom extends Component {
  render() {
    return (
      <div className="bottom">
        <div className="iconWrapper">
          <div className="title">Touch:</div>
          <span className="iconButton"><i className="fa fa-hand-o-left"></i></span>
          <span className="iconButton"><i className="fa fa-hand-o-right"></i></span>
          <span className="iconButton"><i className="fa fa-hand-o-up"></i></span>
          <span className="iconButton"><i className="fa fa-hand-o-down"></i></span>
        </div>
        <div className="iconWrapper desktop">
          <div className="title">Arrows:</div>
          <span className="iconButton"><i className="fa fa-arrow-left"></i></span>
          <span className="iconButton"><i className="fa fa-arrow-right"></i></span>
          <span className="iconButton"><i className="fa fa-arrow-up"></i></span>
          <span className="iconButton"><i className="fa fa-arrow-down"></i></span>
        </div>
        <div className="iconWrapper desktop">
          <div className="title">Gamer:</div>
          <span className="iconButton">w</span>
          <span className="iconButton">s</span>
          <span className="iconButton">a</span>
          <span className="iconButton">d</span>
        </div>
        <div className="iconWrapper desktop">
          <div className="title">l33t:</div>
          <span className="iconButton">h</span>
          <span className="iconButton">j</span>
          <span className="iconButton">k</span>
          <span className="iconButton">l</span>
        </div>
      </div>
    );
  }
}

export default App;

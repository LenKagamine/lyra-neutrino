// @flow strict

import * as React from 'react';
import { connect } from 'react-redux';

import type { StoreState, Dispatch, Song, SongID } from '../../../types';

type Props = {|
  +addSongs: (songs: Song[]) => void
|};

type State = {|
  loading: boolean,
  link: string,
  progress: ?number
|};

class Sources extends React.Component<Props, State> {
  state = {
    loading: false,
    link: '',
    progress: null
  };

  _onChange = (e: SyntheticKeyboardEvent<HTMLInputElement>) => {
    this.setState({
      link: e.currentTarget.value
    });
  };

  _onAdd = () => {
    // TODO: youtube download
  };

  render() {
    return (
      <div>
        <button onClick={this._onAdd}>Add Link</button>
        <input
          type='text'
          placeholder='Youtube URL'
          value={this.state.link}
          onChange={this._onChange}
          disabled={this.state.loading}
        />
        {this.state.loading && (
          <progress value={this.state.progress} max={100} />
        )}
      </div>
    );
  }
}

function mapDispatch(dispatch: Dispatch) {
  return {
    addSongs: (songs: Song[]) => dispatch({ type: 'ADD_SONGS', songs })
  };
}

const ConnectedComp: React.ComponentType<{||}> = connect(
  null,
  mapDispatch
)(Sources);

export default ConnectedComp;

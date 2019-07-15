// @flow strict

import * as React from 'react';
import { connect } from 'react-redux';
import path from 'path';

import VolumeBar from './volume';
import RangeInput from './range';
import { formatDuration } from '../../util';
import { getStreamURL } from '../../yt-util';

import type { StoreState, Song, SongID, Dispatch } from '../../types';

import '../../../css/playback.scss';

type Props = {|
  +currSong: ?Song,
  +shuffle: boolean,
  +skipPrevious: () => void,
  +skipNext: () => void,
  +setShuffle: (shuffle: boolean) => void,
  +dlQueue: SongID[],
  +dlProgress: number
|};

type State = {|
  src: string,
  currentTime: number,
  showDlQueue: boolean
|};

class PlaybackBar extends React.Component<Props, State> {
  state = {
    src: '',
    currentTime: 0,
    showDlQueue: false
  };
  _tempVol = null;
  _audio = React.createRef();

  _onVolumeChange = (volume: number) => {
    /*
      This converts the linear slider to a logarithmic scale in order
       to match our perception of loudnes. The magic number is 100^(1/100),
       which forms a nice log scale from (0,1) to (100,99.999999991).
       In order to mute at 0, the volume is dropped to 0, ignoring the log.
       The 1% dropoff is small enough to be unnoticable.
    */
    const adjusted = volume === 0 ? 0 : Math.pow(1.04712854805, volume);
    if (this._audio.current) {
      this._audio.current.volume = adjusted / 100;
    } else {
      this._tempVol = adjusted;
    }
  };

  _onTimeUpdate = (e: SyntheticEvent<HTMLAudioElement>) => {
    this.setState({
      currentTime: e.currentTarget.currentTime
    });
  };

  _onSeek = (seek: number) => {
    if (this._audio.current) {
      this._audio.current.currentTime = seek;
    }
  };

  _onReplay = () => {
    // Don't need to max 0
    this._onSeek(this.state.currentTime - 10);
  };

  _onForward = () => {
    // Don't need to min duration
    this._onSeek(this.state.currentTime + 10);
  };

  _onTogglePause = () => {
    if (this._audio.current) {
      if (this._audio.current.paused) {
        this._audio.current.play();
      } else {
        this._audio.current.pause();
      }
    }
  };

  _onEnded = () => {
    this._audio.current && this._audio.current.pause();

    this.props.skipNext();
  };

  _onShuffle = () => {
    this.props.setShuffle(!this.props.shuffle);
  };

  _onShowDlQueue = () => {
    this.setState(prevState => ({
      showDlQueue: !prevState.showDlQueue
    }));
  };

  _loadSong = () => {
    const { currSong } = this.props;

    if (!currSong) {
      return;
    }

    // Load song data
    if (currSong.source === 'YOUTUBE') {
      getStreamURL(currSong.id).then(url =>
        this.setState({
          src: url
        })
      );
    } else {
      this.setState({
        src: path.join('file://', currSong.filepath)
      });
    }
  };

  componentDidMount() {
    if (this._tempVol != null) {
      this._onVolumeChange(this._tempVol);
    }

    // TODO: media shortcuts

    this._loadSong();
  }

  componentDidUpdate(prevProps: Props) {
    const { currSong } = this.props;

    if (
      (this.state.src || !currSong) &&
      (!currSong ||
        (prevProps.currSong && currSong.id === prevProps.currSong.id))
    ) {
      return;
    }

    this._loadSong();
  }

  render() {
    const { currSong } = this.props;
    const max =
      this._audio.current && this._audio.current.duration
        ? this._audio.current.duration
        : 0;

    const currTime = formatDuration(this.state.currentTime);
    const maxTime = formatDuration(max);

    const dlProgress = (0 | (this.props.dlProgress * 100)) / 100;

    return (
      <div className='playback-box'>
        <audio
          ref={this._audio}
          src={this.state.src}
          autoPlay
          onTimeUpdate={this._onTimeUpdate}
          onEnded={this._onEnded}
        />
        <div className='playback-bar'>
          <p>{currTime}</p>
          {currSong != null ? (
            <RangeInput
              value={this.state.currentTime}
              max={max}
              onChange={this._onSeek}
            />
          ) : (
            <RangeInput value={0} max={0} />
          )}
          <p>{maxTime}</p>
        </div>
        {currSong != null && (
          <div className='playback-left'>
            <h3>{currSong.title}</h3>
            <br />
            <h5>{currSong.artist}</h5>
          </div>
        )}
        <div className='playback-controls'>
          <button className='skip-previous' onClick={this.props.skipPrevious} />
          <button className='replay-btn' onClick={this._onReplay} />
          <button
            className={
              'play-pause ' +
              (this._audio.current == null || this._audio.current.paused
                ? 'play'
                : 'pause')
            }
            onClick={this._onTogglePause}
            disabled={currSong == null}
          />
          <button className='forward-btn' onClick={this._onForward} />
          <button className='skip-next' onClick={this.props.skipNext} />
        </div>
        <div className='playback-right'>
          <div className='dl-box'>
            {this.props.dlQueue.length > 0 && (
              <>
                <button
                  className='download-btn'
                  onClick={this._onShowDlQueue}
                />
                {this.state.showDlQueue && (
                  <div className='dl-popover'>
                    <h3>Download Queue</h3>
                    <div>{dlProgress}%</div>
                    {this.props.dlQueue.map(id => (
                      <div key={id}>{id}</div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          <button
            className={
              'shuffle-btn ' + (this.props.shuffle ? '' : 'shuffle-off')
            }
            onClick={this._onShuffle}
          />
          <VolumeBar onChange={this._onVolumeChange} />
        </div>
      </div>
    );
  }
}

function mapState(state: StoreState) {
  return {
    currSong: state.currSong,
    shuffle: state.shuffle,
    dlQueue: state.dlQueue,
    dlProgress: state.dlProgress
  };
}

function mapDispatch(dispatch: Dispatch) {
  return {
    skipPrevious: () => dispatch({ type: 'SKIP_PREVIOUS' }),
    skipNext: () => dispatch({ type: 'SKIP_NEXT' }),
    setShuffle: (shuffle: boolean) => dispatch({ type: 'SET_SHUFFLE', shuffle })
  };
}

const ConnectedComp: React.ComponentType<{||}> = connect(
  mapState,
  mapDispatch
)(PlaybackBar);

export default ConnectedComp;

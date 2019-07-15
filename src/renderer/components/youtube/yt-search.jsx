// @flow strict

import * as React from 'react';

import Search from '../search';
import Loading from '../loading';
import YtItem from './yt-item';

import { ytSearch } from '../../yt-util';

import type { VideoSong } from '../../types';

type Props = {|
  +playVideo: (video: VideoSong) => void,
  +initialKeyword?: string
|};

export default function YtSearch(props: Props) {
  const [searching, setSearching] = React.useState(false);
  const [videos, setVideos] = React.useState([]);

  function onSearch(value: string) {
    setSearching(true);

    ytSearch(value).then(videos => {
      setSearching(false);
      setVideos(videos);
    });
  }

  React.useEffect(() => {
    if (props.initialKeyword) {
      onSearch(props.initialKeyword);
    }
  }, []);

  return (
    <>
      <h1>YouTube</h1>
      <Search onEnter={onSearch} initialValue={props.initialKeyword || ''} />
      {searching ? (
        <Loading />
      ) : (
        <ul className='youtube-item-list'>
          {videos.map((video: VideoSong) => (
            <li key={video.id} onClick={() => props.playVideo(video)}>
              <YtItem video={video} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

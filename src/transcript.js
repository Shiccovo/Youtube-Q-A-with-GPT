function compareTracks(track1, track2) {
  const langCode1 = track1.languageCode;
  const langCode2 = track2.languageCode;

  if (langCode1 === 'en' && langCode2 !== 'en') {
    return -1; // English comes first
  } else if (langCode1 !== 'en' && langCode2 === 'en') {
    return 1; // English comes first
  } else if (track1.kind !== 'asr' && track2.kind === 'asr') {
    return -1; // Non-ASR comes first
  } else if (track1.kind === 'asr' && track2.kind !== 'asr') {
    return 1; // Non-ASR comes first
  }

  return 0; // Preserve order if both have same priority
}

export async function getTranscript(videoId,YT_INITIAL_PLAYER_RESPONSE_RE,player) {
  
  console.log('videoId:', videoId); // 调试 videoId
  console.log('player:', player); // 调试 player

  if (player) {
    try {
      const response = await fetch('https://www.youtube.com/watch?v=' + videoId);
      const body = await response.text();

      const playerResponse = body.match(YT_INITIAL_PLAYER_RESPONSE_RE);
      if (!playerResponse) {
        console.error('Error: Unable to parse playerResponse');
        return;
      }
      player = JSON.parse(playerResponse[1]);

      console.log('Parsed player:', player); // 调试解析后的 player

      const metadata = {
        title: player.videoDetails.title,
        duration: player.videoDetails.lengthSeconds,
        author: player.videoDetails.author,
        views: player.videoDetails.viewCount,
      };

      console.log('Metadata:', metadata); // 调试 metadata

      const tracks = player.captions.playerCaptionsTracklistRenderer.captionTracks;
      tracks.sort(compareTracks);
      console.log('Tracks:', tracks); // 调试字幕 tracks

      const transcriptResponse = await fetch(tracks[0].baseUrl + '&fmt=json3');
      const transcript = await transcriptResponse.json();

      console.log('Transcript response:', transcript); // 调试 transcript

      const parsedTranscript = transcript.events
        .filter((x) => x.segs) // 移除无效片段
        .map((x) => x.segs.map((y) => y.utf8).join(' ')) // 合并成单个字符串
        .join(' ')
        .replace(/[\u200B-\u200D\uFEFF]/g, '') // 移除无效字符
        .replace(/\s+/g, ' '); // 用单个空格替换多余空格

      console.log('EXTRACTED_TRANSCRIPT:', parsedTranscript);
      return parsedTranscript;

    } catch (error) {
      console.error('Error in getTranscript:', error);
    }
  }
}

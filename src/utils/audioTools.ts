/**
 * Encodes an AudioBuffer into a standard 16-bit PCM WAV Blob
 */
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  let result: Float32Array;
  if (numChannels === 2) {
    // Interleave left and right
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    result = new Float32Array(left.length + right.length);
    for (let i = 0; i < left.length; i++) {
      result[i * 2] = left[i];
      result[i * 2 + 1] = right[i];
    }
  } else {
    result = buffer.getChannelData(0);
  }

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = result.length * bytesPerSample;
  const bufferLength = 44 + dataSize;
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  // Helper to write ASCII strings
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  /* RIFF identifier */
  writeString(0, 'RIFF');
  /* file length minus 8 bytes */
  view.setUint32(4, 36 + dataSize, true);
  /* RIFF type */
  writeString(8, 'WAVE');
  /* format chunk identifier */
  writeString(12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, format, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, byteRate, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, blockAlign, true);
  /* bits per sample */
  view.setUint16(34, bitDepth, true);
  /* data chunk identifier */
  writeString(36, 'data');
  /* data chunk length */
  view.setUint32(40, dataSize, true);

  // Write PCM samples (clamp -1 to 1 into signed 16-bit integers)
  let offset = 44;
  for (let i = 0; i < result.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, result[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

/**
 * Trim audio buffer to start and end seconds
 */
export async function trimAudio(file: File, startSec: number, endSec: number): Promise<{ blob: Blob; url: string; duration: number }> {
  const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const fileBytes = await file.arrayBuffer();
  const decoded = await audioCtx.decodeAudioData(fileBytes);

  const sampleRate = decoded.sampleRate;
  const startOffset = Math.floor(Math.max(0, startSec) * sampleRate);
  const endOffset = Math.floor(Math.min(decoded.duration, endSec) * sampleRate);
  const frameCount = Math.max(1, endOffset - startOffset);

  const trimmed = audioCtx.createBuffer(decoded.numberOfChannels, frameCount, sampleRate);

  for (let c = 0; c < decoded.numberOfChannels; c++) {
    const channelData = decoded.getChannelData(c);
    const sub = channelData.subarray(startOffset, endOffset);
    trimmed.copyToChannel(sub, c, 0);
  }

  const wavBlob = audioBufferToWav(trimmed);
  return {
    blob: wavBlob,
    url: URL.createObjectURL(wavBlob),
    duration: frameCount / sampleRate,
  };
}

/**
 * Boost audio volume with limiter
 */
export async function boostAudioVolume(file: File, volumeMultiplier: number): Promise<{ blob: Blob; url: string }> {
  const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const fileBytes = await file.arrayBuffer();
  const decoded = await audioCtx.decodeAudioData(fileBytes);

  const channels = decoded.numberOfChannels;
  const length = decoded.length;
  const sampleRate = decoded.sampleRate;

  const boosted = audioCtx.createBuffer(channels, length, sampleRate);

  for (let c = 0; c < channels; c++) {
    const src = decoded.getChannelData(c);
    const dest = boosted.getChannelData(c);
    for (let i = 0; i < length; i++) {
      // Soft saturation clip to avoid harsh digital click
      let sample = src[i] * volumeMultiplier;
      if (sample > 1) sample = 1;
      else if (sample < -1) sample = -1;
      dest[i] = sample;
    }
  }

  const wavBlob = audioBufferToWav(boosted);
  return {
    blob: wavBlob,
    url: URL.createObjectURL(wavBlob),
  };
}

/**
 * Adjust speed/pitch of audio buffer
 */
export async function changeAudioSpeed(file: File, speedMultiplier: number): Promise<{ blob: Blob; url: string }> {
  const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const fileBytes = await file.arrayBuffer();
  const decoded = await audioCtx.decodeAudioData(fileBytes);

  const channels = decoded.numberOfChannels;
  const originalLength = decoded.length;
  const targetLength = Math.floor(originalLength / speedMultiplier);
  const sampleRate = decoded.sampleRate;

  const outputBuffer = audioCtx.createBuffer(channels, targetLength, sampleRate);

  for (let c = 0; c < channels; c++) {
    const src = decoded.getChannelData(c);
    const dest = outputBuffer.getChannelData(c);

    // Linear interpolation resampling
    for (let i = 0; i < targetLength; i++) {
      const srcIndex = i * speedMultiplier;
      const indexFloor = Math.floor(srcIndex);
      const frac = srcIndex - indexFloor;

      if (indexFloor + 1 < originalLength) {
        dest[i] = src[indexFloor] * (1 - frac) + src[indexFloor + 1] * frac;
      } else {
        dest[i] = src[indexFloor] || 0;
      }
    }
  }

  const wavBlob = audioBufferToWav(outputBuffer);
  return {
    blob: wavBlob,
    url: URL.createObjectURL(wavBlob),
  };
}

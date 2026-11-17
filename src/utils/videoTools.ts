import { audioBufferToWav } from './audioTools';

/**
 * Extract audio track from video file and export as high-fidelity WAV
 */
export async function extractAudioFromVideo(videoFile: File): Promise<{ blob: Blob; url: string; duration: number }> {
  const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const fileBytes = await videoFile.arrayBuffer();
  const decoded = await audioCtx.decodeAudioData(fileBytes);

  const wavBlob = audioBufferToWav(decoded);
  return {
    blob: wavBlob,
    url: URL.createObjectURL(wavBlob),
    duration: decoded.duration,
  };
}

/**
 * Capture frame stills from a video file at various intervals
 */
export async function captureVideoFrames(
  videoFile: File,
  frameCount = 5
): Promise<Array<{ time: number; url: string; blob: Blob }>> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    const url = URL.createObjectURL(videoFile);
    video.src = url;

    video.onloadedmetadata = async () => {
      const duration = video.duration || 1;
      const interval = duration / (frameCount + 1);
      const results: Array<{ time: number; url: string; blob: Blob }> = [];

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      const ctx = canvas.getContext('2d');

      for (let i = 1; i <= frameCount; i++) {
        const targetTime = i * interval;
        video.currentTime = targetTime;
        await new Promise((r) => {
          video.onseeked = r;
        });

        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.9));
          results.push({
            time: Math.round(targetTime * 10) / 10,
            url: URL.createObjectURL(blob),
            blob,
          });
        }
      }

      URL.revokeObjectURL(url);
      resolve(results);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video file for frame extraction'));
    };
  });
}

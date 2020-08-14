function randomIndex(length) {
  return Math.ceil(Math.random() * length) - 1;
}

function pickRandom(list) {
  return list[randomIndex(list.length)];
}

const previewStubs = [
  "https://images.unsplash.com/photo-1561839561-b13bcfe95249?crop=entropy&fit=crop&h=117&w=272&q=80",
  "https://images.unsplash.com/photo-1595781257970-13e3f0586fcf?crop=entropy&fit=crop&h=117&w=272&q=80",
  "https://images.unsplash.com/photo-1559004328-d65ee06c5947?crop=entropy&fit=crop&h=117&w=272&q=80",
  "https://images.unsplash.com/photo-1589991410175-1aab16300bf7?crop=entropy&fit=crop&h=117&w=272&q=80",
  "https://images.unsplash.com/photo-1549887534-1541e9326642?crop=faces&fit=crop&h=117&w=272&q=80",
  "https://images.unsplash.com/photo-1549887552-cb1071d3e5ca?crop=faces&fit=crop&h=117&w=272&q=80",
  "https://images.unsplash.com/photo-1548811579-017cf2a4268b?fit=crop&h=117&w=272&q=80",
  "https://images.unsplash.com/photo-1579947642314-54b5f8c806ab?crop=faces&fit=crop&h=117&w=272&q=80",
];

export default class Transform {
  constructor() {}

  fetchFileResults(data) {
    const counts = {
      total: data.count,
      duplicates: 0,
      related: 0,
      unique: data.count,
    };

    const files = data.posts.map((post) => this.videoMetadata(post));
    return { files, counts };
  }

  videoMetadata(data) {
    return {
      id: data.original_filename,
      filename: data.original_filename,
      metadata: {
        grayAverage: data.gray_avg,
        fileType: data.file_type,
        codec: data.codec,
        hasAudio: data.has_audio,
        grayMax: data.gray_max,
        grayStd: data.gray_std,
        length: data.video_length,
        stdAverage: data.video_avg_std,
        maxDiff: data.video_max_dif,
        flagged: data.flagged,
        hasEXIF: data.exif != null,
      },
      hash: data.hash,
      fingerprint: data.fingerprint,
      exif: data.exif,
      preview: pickRandom(previewStubs),
    };
  }
}

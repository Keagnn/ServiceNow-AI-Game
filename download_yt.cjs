const fs = require('fs');
const ytdl = require('@distube/ytdl-core');

const url = 'https://www.youtube.com/watch?v=RANZlad2BS0';
console.log('Starting download for ' + url);

const stream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });

stream.pipe(fs.createWriteStream('public/songs/yt_song.webm'));

stream.on('end', () => {
  console.log('Download finished successfully.');
});

stream.on('error', (err) => {
  console.error('Download error:', err);
});

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');

app.post('/upload', upload.single('video'), async (req, res) => {
    try {
        const videoPath = 'path/to/input/video.mp4';
        const audioPath = 'path/to/output/audio.mp3';

        ffmpeg.setFfmpegPath('/path/to/ffmpeg');

        ffmpeg(videoPath)
            .output(audioPath)
            .noVideo()
            .on('end', () => {
                console.log('Audio extracted successfully');
            })
            .on('error', (err) => {
                console.error('Error extracting audio:', err);
            })
            .run();

        const apiKey = 'YOUR_OPENAI_API_KEY';

        axios.post(
            process.env.OPEN_API,
            {
                audio_url: audioPath,
                min_confidence: 0.5,
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
            }
        )
            .then((response) => {
                const captions = response.data;
                console.log('Captions:', captions);
            })
            .catch((error) => {
                console.error('Error getting captions:', error);
            });

        const captions = [
            { start: 9.99, end: 13.58, text: 'You' },
            { start: 13.58, end: 15.39, text: 'will' },
        ];

        const timestampsArray = captions.map((caption, index) => {
            const { start, end, text } = caption;
            const isLastCaption = index === captions.length - 1;
            const nextCaption = isLastCaption ? null : captions[index + 1];
            const breakTimestamp = isLastCaption ? end : nextCaption.start;
            const breakDuration = breakTimestamp - end;
            return {
                start,
                text,
                end: breakTimestamp,
                break: breakDuration > 1,
            };
        });

        console.log('Timestamps Array:', timestampsArray);

        res.json({ videoPath: process.env.PROCESSED_URL, captions: timestampsArray });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

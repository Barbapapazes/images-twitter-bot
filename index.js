import dotenv from 'dotenv'
dotenv.config()

import fs from 'fs'
import { join } from 'path'

import Twitter from 'twitter'
import cron from 'node-cron'

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
})

function loadImages(path) {
  return fs.readdirSync(path)
}

function loadImage(path, filename) {
  return fs.readFileSync(join(path, filename))
}

function getRandomFrom(items) {
  return items[Math.floor(Math.random() * items.length)]
}

function moveFile(toMove, items) {
  fs.rename(join('./images', toMove), join('./used', toMove), function (err) {
    if (err) throw err
  })
}

function removeFrom(items, item) {
  const index = items.indexOf(item)
  if (index > -1) {
    items.splice(index, 1)
  }
}

function tweet(file) {
  // Make post request on media endpoint. Pass file data as media parameter
  client.post(
    'media/upload',
    { media: file },
    function (error, media, response) {
      if (!error) {
        // If successful, a media object will be returned.
        console.log(media)

        // Lets tweet it
        var status = {
          status: '',
          media_ids: media.media_id_string, // Pass the media id string
        }

        client.post(
          'statuses/update',
          status,
          function (error, tweet, response) {
            if (!error) {
              console.log(tweet)
            } else {
              throw error
            }
          }
        )
      }
    }
  )
}

const files = loadImages('./images')

cron.schedule('45 7-23 * * *', () => {
  const filename = getRandomFrom(files)
  if (filename) {
    const file = loadImage('./images', filename)
    console.log(file)
    tweet(file)
    moveFile(filename, files)
    removeFrom(files, filename)
  }
})

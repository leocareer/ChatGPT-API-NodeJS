import axios from 'axios'

class OggConverter {
  constructor(){

  }

  toMp3() {}

  async create(url, filename) {
    try {
      const response = await axios ({
        method: 'get',
        url,
        responseType: 'stream'
      })
    } catch (e) {
      console.log('ERROR CREATING OGG', e.message)
    }
  }
}

export const ogg = new OggConverter()
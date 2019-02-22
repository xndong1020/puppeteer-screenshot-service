const express = require('express')
const router = express.Router()
const puppeteer = require('puppeteer')
const path = require('path')
const image2base64 = require('image-to-base64')

require('dotenv').config()
const LOGIN_URL = process.env.LOGIN_URL || 'http://localhost:3000/users/login'

const delay = require('../utils/delay')

/* GET home page. */
router.get('/', async (req, res, next) => {
  res.render('index', { title: 'Screenshot Service' })
})

router.post('/', async (req, res, next) => {
  const { userID, url, reportId } = req.body
  if (!userID) return res.status(401).send()
  if (!url || !reportId) return res.status(400).send()

  try {
    const imageStr = await generateImageBase64(url, reportId)
    res.send(imageStr)
  } catch (e) {
    res
      .status(500)
      .send(
        `error when getting image from url is ${url}, reportId is ${reportId}`
      )
  }
})

const generateImageBase64 = async (url, name) => {
  const fileDirectory = path.join(__dirname, '..', 'screenshots')
  const filePath = `${fileDirectory}/${name}.jpg`

  try {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 })
    await page.goto(LOGIN_URL, { waitUntil: 'networkidle2' })
    await page.focus('#email')
    await page.keyboard.type('isdance2004@hotmail.com', { delay: 50 })
    await page.focus('#password')
    await page.keyboard.type('123456', { delay: 50 })
    await page.click('#loginBtn')
    await delay(3000)
    await page.goto(url, { waitUntil: 'networkidle2' })

    console.info(`getting image from ${url}, reportId is ${name}`)
    // await page.screenshot({ path: filePath, fullPage: true })
    await screenshotDOMElement(page, {
      path: filePath,
      selector: '#report-container',
      padding: 16
    })
    // return filePath
    const imageStr = await imageToBase64(filePath)
    await browser.close()
    return imageStr
  } catch (e) {
    console.error(e)
    throw e
  }
}

const screenshotDOMElement = async (page, opts = {}) => {
  const padding = 'padding' in opts ? opts.padding : 0
  const path = 'path' in opts ? opts.path : null
  const selector = opts.selector

  if (!selector) throw Error('Please provide a selector.')

  const rect = await page.evaluate(selector => {
    const element = document.querySelector(selector)
    if (!element) return null
    const { x, y, width, height } = element.getBoundingClientRect()
    return { left: x, top: y, width, height, id: element.id }
  }, selector)

  if (!rect)
    throw Error(`Could not find element that matches selector: ${selector}.`)

  return await page.screenshot({
    path,
    clip: {
      x: rect.left - padding,
      y: rect.top - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2
    }
  })
}

const imageToBase64 = path => {
  return new Promise((resolve, reject) => {
    image2base64(path) // you can also to use url
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}

module.exports = router

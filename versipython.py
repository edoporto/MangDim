import asyncio
import os
from pyppeteer import launch
async def process_urls():
    try:
        with open('listurl.txt', 'r') as file:
            url_array = [url.strip() for url in file.readlines()]
        log_file_path = 'log.txt'
        with open(log_file_path, 'a') as log_file:
            log_file.write('=======\n')
        browser = await launch()
        for url in url_array:
            if url:
                page = await browser.newPage()
                await page.goto(url)
                title = await page.title()
                content = await page.evaluate('() => document.body.innerText')
                screenshot_path = f'screenshot_{url.replace("/", "_")}.png'
                await page.screenshot({'path': screenshot_path})
                with open(log_file_path, 'a') as log_file:
                    log_file.write(f'URL: {url}\n')
                    log_file.write(f'Title: {title}\n')
                    log_file.write(f'Content: {content}\n')
                    log_file.write('=======\n')
                await page.close()
        await browser.close()
    except Exception as e:
        print('Error:', e)
asyncio.get_event_loop().run_until_complete(process_urls())

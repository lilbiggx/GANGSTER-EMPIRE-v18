import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as pw:
        b=await pw.chromium.launch(args=["--use-gl=swiftshader","--enable-webgl","--ignore-gpu-blocklist"])
        pg=await b.new_page(viewport={"width":256,"height":256})
        pg.on("console", lambda m: print(m.text))
        for g in ["male","female"]:
            for mode in ["portrait","full"]:
                await pg.goto(f"http://127.0.0.1:5191/__portrait.html?g={g}&mode={mode}")
                await pg.wait_for_function("document.title==='done'", timeout=30000)
                el=await pg.query_selector("#c")
                await el.screenshot(path=f"/workspace/gangster-empire-v9/public/portraits/{g}{'' if mode=='portrait' else '-full'}.png", omit_background=True)
        await b.close()
asyncio.run(main())

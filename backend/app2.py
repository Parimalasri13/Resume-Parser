from playwright.sync_api import sync_playwright
from urllib.parse import quote
import pandas as pd
import time
import random
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import os

CHROME_PROFILE_PATH = r"C:\Users\ynara\udc-profile"

def bing_search_playwright(job_title, num_pages=1):
    links = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        base = "https://www.bing.com/search?q="
        query = f'site:linkedin.com/in "{job_title}" "resume"'

        for page_num in range(num_pages):
            offset = page_num * 10 + 1
            url = f"{base}{quote(query)}&first={offset}"
            print(f"[INFO] Searching Bing: {url}")
            page.goto(url, timeout=60000)
            page.wait_for_timeout(random.uniform(3000, 5000))

            result_links = page.locator("li.b_algo h2 a")
            count = result_links.count()
            for i in range(count):
                href = result_links.nth(i).get_attribute("href")
                if href and "linkedin.com/in/" in href:
                    links.append(href)

        browser.close()
    return list(set(links))

def scrape_profiles_udc(links):
    options = uc.ChromeOptions()
    options.add_argument("--start-maximized")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument(f"--user-data-dir={CHROME_PROFILE_PATH}")

    driver = uc.Chrome(options=options, use_subprocess=True)
    candidates = []

    for idx, link in enumerate(links, 1):
        print(f"\n[INFO] ({idx}/{len(links)}) Visiting: {link}")
        try:
            driver.get(link)
            time.sleep(random.uniform(4, 6))
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight / 2)")
            time.sleep(2)

            try:
                name = driver.find_element(By.TAG_NAME, "h1").text.strip()
            except:
                name = "Name Not Found"

            try:
                profile_info = driver.find_element(By.CLASS_NAME, "text-body-medium").text.strip()
            except:
                profile_info = "Info Not Found"

            try:
                companies = driver.find_elements(By.CLASS_NAME, "t-14")
                company_names = []
                for span in companies:
                    text = span.text.strip()
                    if text and "·" in text:
                        company_names.append(text)
                prev_company = " | ".join(set(company_names)) if company_names else "Not Found"
            except:
                prev_company = "Not Found"

            try:
                edu_elem = driver.find_elements(By.CLASS_NAME, "hoverable-link-text")
                edu_texts = [e.text.strip() for e in edu_elem if e.text.strip()]
                education = " | ".join(edu_texts) if edu_texts else "Not Found"
            except:
                education = "Not Found"

            try:
                resume_button = driver.find_element(By.XPATH, "//span[text()='Save to PDF']")
                resume_link = link
            except:
                resume_link = "Not Available"

            
            try:
                skill_divs = driver.find_elements(By.XPATH, "//div[contains(@class, 'hoverable-link-text') and contains(@class, 't-bold')]")
                skills = [el.text.strip() for el in skill_divs if el.text.strip()]
                skill_text = " | ".join(set(skills)) if skills else "Not Found"
            except:
                skill_text = "Not Found"

            
            try:
                role_divs = driver.find_elements(By.XPATH, "//div[contains(@class,'flex-wrap')]/descendant::div[contains(@class,'hoverable-link-text') and contains(@class,'t-bold')]")
                roles = [el.text.strip() for el in role_divs if el.text.strip()]
                role_text = " | ".join(set(roles)) if roles else "Not Found"
            except:
                role_text = "Not Found"

            candidates.append((
                name, link, profile_info, prev_company,
                education, resume_link, skill_text, role_text
            ))

        except Exception as e:
            print(f"[ERROR] Could not process {link}: {e}")
            candidates.append((
                "Error", link, "N/A", "N/A", "N/A", "N/A", "N/A", "N/A"
            ))

    driver.quit()
    return candidates

def save_to_excel(data, filename="linkedin_profiles_udc.xlsx"):
    df = pd.DataFrame(data, columns=[
        "Candidate Name", "Profile URL", "Profile Info",
        "Previous Company", "Education", "Resume Link",
        "Skills", "Roles"
    ])
    df.to_excel(filename, index=False)
    print(f"\n Data saved to: {filename}")

if __name__ == "__main__":
    job = input("Enter job title: ").strip()
    urls = bing_search_playwright(job, num_pages=2)

    print(f"\n Found {len(urls)} LinkedIn profile links.")
    for url in urls:
        print(url)

    if urls:
        output = scrape_profiles_udc(urls)
        save_to_excel(output)
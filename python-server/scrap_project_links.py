import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.firefox import GeckoDriverManager

driver = webdriver.Firefox(service=Service(GeckoDriverManager().install()))

driver.get("https://www.codedex.io/projects")
wait = WebDriverWait(driver, 10)

projects = []

try:
    # Extract titles
    titles = [title.text for title in driver.find_elements(By.CSS_SELECTOR, "p.project_title")]

    # Extract links
    links = [
        link.get_attribute("href") 
        for link in driver.find_elements(By.CSS_SELECTOR, "a") 
        if "project" in link.get_attribute("href")
    ]

    # Extract tags
    all_tags = []
    tag_sections = driver.find_elements(By.CSS_SELECTOR, "div.tags")
    for section in tag_sections:
        tags = [tag.text for tag in section.find_elements(By.CSS_SELECTOR, "p.tag")]
        all_tags.append(tags)

    # Extract images
    images = [
        img.get_attribute("src") 
        for img in driver.find_elements(By.CSS_SELECTOR, "img[alt='project image']")
    ]

    # Add the data into JSON 
    for i in range(max(len(titles), len(links), len(all_tags), len(images))):
        projects.append({
            "title": titles[i] if i < len(titles) else "",
            "link": links[i] if i < len(links) else "",
            "tags": all_tags[i] if i < len(all_tags) else [],
            "image": images[i] if i < len(images) else ""
        })

except Exception as e:
    print(f"Error: {e}")

# Write the data to a JSON file
with open("codedex_projects.json", "w", encoding="utf-8") as f:
    json.dump(projects, f, indent=4)

print("Data saved to codedex_projects.json")

driver.quit()

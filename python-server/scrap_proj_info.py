import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.firefox.service import Service
from webdriver_manager.firefox import GeckoDriverManager

with open("codedex_projects.json", "r", encoding="utf-8") as f:
    projects = json.load(f)

driver = webdriver.Firefox(service=Service(GeckoDriverManager().install()))

for project in projects:
    url = project.get("link", "")
    
    if url:
        print(f"Visiting: {url}")
        driver.get(url)

        # Extract h2 tag as reference
        try:
            intro_h2 = driver.find_element(By.ID, "introduction")

            # Get intial Info
            prerequisite_data = {}
            
            preceding_paragraphs = driver.find_elements(By.XPATH, "//h2[@id='introduction']/preceding-sibling::p")
            
            for p in preceding_paragraphs:
                html_content = p.get_attribute("innerHTML")
                
                # Split content by <br> tags
                lines = html_content.split("<br>")
                
                for line in lines:
                    if "<strong>" in line:
                        key = line.split("<strong>")[1].split("</strong>")[0].strip()
                        value = line.split("</strong>")[1].strip()
                        prerequisite_data[key] = value

            project["prerequisite"] = prerequisite_data

        except Exception:
            print(f"No introduction or prerequisite section found for {url}")

        # h2 checkpoints
        checkpoints = [cp.text for cp in driver.find_elements(By.TAG_NAME, "h2")]

        project["checkpoints"] = []

        for i in range(2, len(checkpoints)):
            cp = checkpoints[i]
            checkpoint_data = {"checkpoint": cp, "content": []}

            # Get all siblings after the current h2 until the next h2
            current_h2_xpath = f"(//h2)[{i + 1}]"
            next_h2_xpath = f"(//h2)[{i + 2}]" if i + 1 < len(checkpoints) else ""

            # Capture everything until the next h2
            xpath_range = f"{current_h2_xpath}/following-sibling::*"
            if next_h2_xpath:
                xpath_range += f"[following::h2[1][.={next_h2_xpath}]]"

            siblings = driver.find_elements(By.XPATH, xpath_range)

            for sibling in siblings:
                tag = sibling.tag_name

                # Extract paragraphs
                if tag == "p":
                    checkpoint_data["content"].append({
                        "type": "p",
                        "text": sibling.text
                    })

                # Extract images
                elif tag == "img":
                    checkpoint_data["content"].append({
                        "type": "img",
                        "src": sibling.get_attribute("src")
                    })

                # Extract <pre> tags which contain codes
                elif tag == "pre":
                    checkpoint_data["content"].append({
                        "type": "pre",
                        "text": sibling.text
                    })

                # Extract h3 with li tags
                elif tag == "h3":
                    li_tags = sibling.find_elements(By.XPATH, "./following-sibling::ul[1]/li")
                    li_text = [li.text for li in li_tags] if li_tags else []

                    checkpoint_data["content"].append({
                        "type": "h3-li",
                        "h3": sibling.text,
                        "li": li_text
                    })

            project["checkpoints"].append(checkpoint_data)

        print(f"Extracted from {url}")

with open("codedex_projects.json", "w", encoding="utf-8") as f:
    json.dump(projects, f, indent=4, ensure_ascii=False)

print(f"\nData appended")

driver.quit()

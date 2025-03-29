import requests
from bs4 import BeautifulSoup
import json
import time
from datetime import datetime
import argparse
import os
import re

def parse_medium_article(url):
    """
    Parse a Medium article and extract its content and metadata.
    
    Args:
        url (str): URL of the Medium article
        
    Returns:
        dict: Article data with metadata
    """
    try:
        # Add user-agent to mimic browser and avoid being blocked
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # Implement a polite delay to avoid rate limiting
        time.sleep(2)
        
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Raise exception for HTTP errors
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract metadata
        title = soup.find('h1')
        title_text = title.get_text().strip() if title else "Unknown Title"
        
        # Find author information
        author_elem = soup.find('a', {'rel': 'author'}) or soup.find('a', {'href': re.compile(r'@')})
        author = author_elem.get_text().strip() if author_elem else "Unknown Author"
        
        # Find date
        date_elem = soup.find('time') or soup.select_one('[datetime]')
        publish_date = date_elem['datetime'] if date_elem and date_elem.has_attr('datetime') else None
        
        # Get reading time if available
        reading_time_elem = soup.find(text=re.compile(r'\d+ min read')) or soup.find(text=re.compile(r'\d+ minute read'))
        reading_time = reading_time_elem.strip() if reading_time_elem else "Unknown"
        
        # Extract tags/topics
        tags_elems = soup.select('a[href*="tag/"], a[data-action="show-tag-drawer"]')
        tags = [tag.get_text().strip() for tag in tags_elems if tag.get_text().strip()]
        
        # Extract main article content
        # This might need adjustment based on Medium's current HTML structure
        article_sections = soup.select('article section')
        
        content = []
        for section in article_sections:
            paragraphs = section.find_all(['p', 'h1', 'h2', 'h3', 'blockquote', 'pre', 'figure'])
            for p in paragraphs:
                if p.name == 'figure':
                    img = p.find('img')
                    if img and img.get('src'):
                        content.append({
                            "type": "image",
                            "content": img.get('src'),
                            "alt": img.get('alt', '')
                        })
                else:
                    text = p.get_text().strip()
                    if text:
                        content.append({
                            "type": p.name,
                            "content": text
                        })
        
        # Get article claps/likes if available
        claps_elem = soup.find(text=re.compile(r'\d+[KkMm]? claps')) or soup.find('button', string=re.compile(r'\d+'))
        claps = claps_elem.strip() if claps_elem else "Unknown"
        
        # Create article object
        article_data = {
            "url": url,
            "title": title_text,
            "author": author,
            "published_date": publish_date,
            "reading_time": reading_time,
            "tags": tags,
            "content": content,
            "claps": claps,
            "scraped_at": datetime.now().isoformat(),
        }
        
        return article_data
    
    except Exception as e:
        print(f"Error processing {url}: {str(e)}")
        return {
            "url": url,
            "error": str(e),
            "scraped_at": datetime.now().isoformat(),
        }

def main():
    parser = argparse.ArgumentParser(description='Scrape Medium articles and save to JSON')
    parser.add_argument('-f', '--file', help='File containing Medium article URLs (one per line)')
    parser.add_argument('-u', '--urls', nargs='+', help='Medium article URLs to scrape')
    parser.add_argument('-o', '--output', default='medium_articles.json', help='Output JSON file')
    args = parser.parse_args()
    
    urls = []
    
    if args.file:
        try:
            with open(args.file, 'r') as f:
                urls = [line.strip() for line in f if line.strip()]
        except Exception as e:
            print(f"Error reading file {args.file}: {str(e)}")
            return
    
    if args.urls:
        urls.extend(args.urls)
    
    if not urls:
        print("No URLs provided. Use -f to provide a file with URLs or -u to provide URLs directly.")
        return
    
    articles = []
    for i, url in enumerate(urls):
        print(f"Processing article {i+1}/{len(urls)}: {url}")
        article_data = parse_medium_article(url)
        articles.append(article_data)
    
    # Save to JSON file
    with open(args.output, 'w', encoding='utf-8') as f:
        json.dump(articles, f, ensure_ascii=False, indent=2)
    
    print(f"Scraped {len(articles)} articles and saved to {args.output}")

if __name__ == "__main__":
    main()
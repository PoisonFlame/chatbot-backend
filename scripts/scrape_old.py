import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
from multiprocessing import Manager
import threading
import re
import argparse
import json

startTime = time.time()
qcount = 0
ids = []
products = []  # List to store name of the produ
prices = []  # List to store price of the product
ratings = []  # List to store ratings of the product
links = []
imageLinks = []
no_pages = 10


def get_data(pageNo, q):
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:66.0) Gecko/20100101 Firefox/66.0",
               "Accept-Encoding": "gzip, deflate",
               "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.9", "DNT": "1",
               "Connection": "close", "Upgrade-Insecure-Requests": "1"}

    r = requests.get("https://www.amazon.com/s?k=" + s + str(pageNo) , headers=headers)
    content = r.content
    soup = BeautifulSoup(content, 'html.parser')
    # print(soup.encode('utf-8')) # uncomment this in case there is some non UTF-8 character in the content and
    # you get error
    # for k in soup.findAll('div', attrs={'class': 'sg-col-4-of-24 sg-col-4-of-12 sg-col-4-of-36 sg-col-4-of-28 sg-col-4-of-16 sg-col sg-col-4-of-20 sg-col-4-of-32'}):
    #     for i in k.findAll('span', attrs= {'class': 'a-size-base a-color-base a-text-bold'}):
    #         category = i.find('span', attrs={'class':'a-size-base a-color-base'})
    #         print(category)
    count = 0
    for i in soup.find_all("img"):
        # print(i.get('src'))
        x= i.get('src')
        if (x.startswith('https://m.media') is True and len(x) == 62):
            imageLink = x
            count = count +1
            imageLinks.append(imageLink)
            # print(imageLink,count)


    for d in soup.findAll('div', attrs={
        'class': 'sg-col-4-of-12 sg-col-8-of-16 sg-col-16-of-24 sg-col-12-of-20 sg-col-24-of-32 sg-col sg-col-28-of-36 sg-col-20-of-28'}):
        name = d.find('span', attrs={'class': 'a-size-medium a-color-base a-text-normal'})
        price = d.find('span', attrs={'class': 'a-offscreen'})
        rating = d.find('span', attrs={'class': 'a-icon-alt'})
        link = d.find('a', attrs={'class': 'a-link-normal a-text-normal'})
        # id = link.split("/dp/")[1].split("/")[0]
        id = re.search(r'B[A-Z0-9]{9}', str(link)).group(0)


        # category = d.find('span', attrs={'class':'a-size-base a-color-base'})
        # links = soup.find_all('a', {'class': 'a-link-normal s-access-detail-page a-text-normal'})
        all = []
        if id is not None:
            all.append(id)
        else:
            all.append("-1")

        if name is not None:
            all.append(name.text)
        else:
            all.append("unknown-product")

        if price is not None:
            all.append(price.text)
        else:
            all.append('$0')

        if rating is not None:
            all.append(rating.text)
        else:
            all.append('-1')

        # if category is not None:
        #     all.append(category.text)
        # else:
        #     all.append("unknown")

        #
        # if category is not None:
        #     all.append(category.text)
        # else:
        #     all.append("unknown")

        if link is not None:
            all.append("https://www.amazon.com" + link.get('href'))
        else:
            all.append('-1')

        q.put(all)
        # print("---------------------------------------------------------------")

    # links = soup.find_all('a', {'class': 'a-link-normal s-access-detail-page a-text-normal'})
    # for link in links:
    #       print(link.get('href'))

results = []
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Scraper for Chatbot')
    parser.add_argument('-k', help='add keyword for product e.g. laptop', required=True)
    args = parser.parse_args()
    s = args.k
    # s = input("Enter keyword: ")
    for d in range(20):
        m = Manager()
        q = m.Queue()  # use this manager Queue instead of multiprocessing Queue as that causes error
        p = {}
        if len(products) !=0:
            break
        else:
    #while len(products)==0:

            for i in range(1, no_pages):
                print("starting thread: ", i)
                p[i] = threading.Thread(target=get_data, args=(i, q))
                p[i].start()
            for i in range(1, no_pages):
                p[i].join()
            while q.empty() is not True:
                qcount = qcount + 1
                queue_top = q.get()
                ids.append(queue_top[0])
                products.append(queue_top[1])
                prices.append(queue_top[2])
                ratings.append(queue_top[3])
                # categories.append(queue_top[3])
                links.append(queue_top[4])

        print("total time taken: ", str(time.time() - startTime), " qcount: ", qcount)
        # print(q.get())
        df = pd.DataFrame({'Product Id' : ids,'Product Name': products, 'Price': prices, 'Ratings': ratings,'Link': links,'ImgUrl':imageLinks}) #
        print(df)
        for i in range(df.size):
            out_dict = {
                    "id": str(ids[i]),
                    "Name" : str(products[i]),
                    "Price": str(prices[i]),
                    "Rating" : str(ratings[i]),
                    "Link" : str(links[i]),
                    "ImgUrl" : str(imageLinks[i])
                    }
            req = requests.post('http://100.24.238.133:8081/api/products', json=(out_dict))
            print(json.dumps(out_dict))
        #df.to_csv('products.csv', index=False, encoding='utf-8')

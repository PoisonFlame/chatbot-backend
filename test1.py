import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
from multiprocessing import Manager
import threading
import sys

startTime = time.time()
qcount = 0
products = []  # List to store name of the product
prices = []  # List to store price of the product
ratings = []  # List to store ratings of the product
no_pages = 10


def get_data(pageNo, q):
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:66.0) Gecko/20100101 Firefox/66.0",
               "Accept-Encoding": "gzip, deflate",
               "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.9", "DNT": "1",
               "Connection": "close", "Upgrade-Insecure-Requests": "1"}

    r = requests.get("https://www.amazon.com/s?k="+ s + str(pageNo) , headers=headers)
    content = r.content
    soup = BeautifulSoup(content, 'html.parser')
    # print(soup.encode('utf-8')) # uncomment this in case there is some non UTF-8 character in the content and
    # you get error

    for d in soup.findAll('div', attrs={
        'class': 'sg-col-4-of-12 sg-col-8-of-16 sg-col-16-of-24 sg-col-12-of-20 sg-col-24-of-32 sg-col sg-col-28-of-36 sg-col-20-of-28'}):
        name = d.find('span', attrs={'class': 'a-size-medium a-color-base a-text-normal'})
        price = d.find('span', attrs={'class': 'a-offscreen'})
        rating = d.find('span', attrs={'class': 'a-icon-alt'})
        all = []

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
        q.put(all)
        # print("---------------------------------------------------------------")


results = []
if __name__ == "__main__":
    s = input("Enter keyword: ")
    while len(products)==0:
        m = Manager()
        q = m.Queue()  # use this manager Queue instead of multiprocessing Queue as that causes error
        p = {}
        for i in range(1, no_pages):
            print("starting thread: ", i)
            p[i] = threading.Thread(target=get_data, args=(i, q))
            p[i].start()
        for i in range(1, no_pages):
            p[i].join()
        while q.empty() is not True:
            qcount = qcount + 1
            queue_top = q.get()
            products.append(queue_top[0])
            prices.append(queue_top[1])
            ratings.append(queue_top[2])

        print("total time taken: ", str(time.time() - startTime), " qcount: ", qcount)
        # print(q.get())
        df = pd.DataFrame({'Product Name': products, 'Price': prices, 'Ratings': ratings})
        print(df)
        df.to_csv('products.csv', index=False, encoding='utf-8')
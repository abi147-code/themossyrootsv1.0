import urllib.request,re
url='https://tmr-proxy.fly.dev/_next/static/chunks/app/dashboard/invoice-generator/page-50a5ad26449c42c3.js'
data=urllib.request.urlopen(url).read().decode('utf-8')
matches=re.findall(r'https?://[^\"\']+', data)
print('urls', matches)

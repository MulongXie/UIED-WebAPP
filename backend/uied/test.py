import json

f = open('parameters/parameters.txt', 'r').readlines()[-1].split()
print(f[-1])
j = json.loads(f[-1])

print(j)
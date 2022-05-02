import json
from multiprocessing.connection import wait
import time

import subprocess


# Python program showing 
# a use of input()

#Define The user interface

def main():
    #Get user inputs
    start = time.time()
    ex = input("Enter the image file txt path: ")
    print(ex)
    s_input = ex
    print("This is the file path : "+ s_input)
    
    with open(s_input) as f:
        content = f.read().rstrip()
    
    chunks_lenght = 105
    chunks = [content[i:i+chunks_lenght] for i in range(0, len(content), chunks_lenght)]
    
    send_chunks(chunks)
    end = time.time()

    print("Time Elapsed was: " + str(end - start))
    print("Time per chunks was : " + str((end - start)/len(chunks)))

def send_chunks(content):
    for idx, x in enumerate(content):
        if(idx == len(content)):
            data_json = {"part": idx+1, "content": x,"imageId": 1}
        else:
            data_json = {"part": 0, "content": x,"imageId": 1}
        inp = convert_to_hex(json.dumps(data_json))
        call_docker(inp)

def convert_to_hex(s_input):
    return "0x"+str(s_input.encode("utf-8").hex())

def call_docker(h_input):
    subprocess.call("npx hardhat --network localhost img-proc:addInput --input "+h_input, shell=True)

main()


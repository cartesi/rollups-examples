import json
from multiprocessing.connection import wait
import time
import base64

import subprocess


# Python program showing 
# a use of input()

#Define The user interface

def main():
    #Get user inputs
    start = time.time()
    ex = input("Please Enter the image file path")
    print(ex)
    s_input = ex
    print("This is the file path : "+ s_input)
    
    with open(s_input, "rb") as image_file:
        content = base64.b64encode(image_file.read())
    
    chunks_lenght = 90000
    chunks = [content[i:i+chunks_lenght] for i in range(0, len(content), chunks_lenght)]
    
    send_chunks(chunks)
    end = time.time()

    print("Time Elapsed was: " + str(end - start))
    print("Time per chunks was : " + str((end - start)/len(chunks)))

def send_chunks(content):
    for idx, x in enumerate(content):
        if((idx+1)==len(content)):
            strinput = {"chunk": "final", "content": x,"imageId": "4"}
        else:
            strinput = {"chunk": idx+1, "content": x,"imageId": "4"}
        inp = convert_to_hex(json.dumps(strinput))
        call_docker(inp)

def convert_to_hex(s_input):
    return "0x"+str(s_input.encode("utf-8").hex())

def call_docker(h_input):
    subprocess.call("npx hardhat --network localhost biometrics:addInput --input "+h_input, shell=True)

main()


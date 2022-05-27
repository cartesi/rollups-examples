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
    ex = input("Please Enter the image file\n")
    print(ex)
    s_input = ex
    print("This is the file : "+ s_input)
    
    with open(s_input, "rb") as image_file:
        content = base64.b64encode(image_file.read())
        content = content.decode("utf-8")
    
    chunks_lenght = 50000
    chunks = [content[i:i+chunks_lenght] for i in range(0, len(content), chunks_lenght)]
    
    send_chunks(chunks, s_input)
    end = time.time()
    print("Image Sent!")
    print("Time Elapsed was: " + str(end - start))
    print("Time per chunks was : " + str((end - start)/len(chunks)))

def send_chunks(content, input):
    for idx, x in enumerate(content):
        if((idx+1)==len(content)):
            strinput = {"chunk": "final", "content": x,"imageId": input}
        else:
            strinput = {"chunk": idx+1, "content": x,"imageId": input}
        inp = convert_to_hex(json.dumps(strinput))
        call_docker(inp)

def convert_to_hex(s_input):
    return "0x"+str(s_input.encode("utf-8").hex())

def call_docker(h_input):
    subprocess.call("npx hardhat --network localhost biometrics:addInput --input "+h_input, shell=True)

main()


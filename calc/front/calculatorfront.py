#!/usr/bin/python
import json
from multiprocessing.connection import wait

import subprocess


# Python program showing 
# a use of input()

#Define The user interface

header = """
=========================================================================
========== 💰 Cartesi x Locus 🧾 ======
========== ✨ Simply Math Calculator DApp😊 =======
=========================================================================
======================== This Dapp only does simply math =========================

>>---> Press ctrl + c finish the calculator."""


def main():
    #Get user inputs
    print(header)
    op = input("Enter the operation: ")
    print(op)
    fo = input("Enter the first operand: ")
    print(fo)
    so = input("Enter the second operand: ")
    print(so)
    s_input = format_to_input(op,fo,so)
    print("This is Operation Info String : "+ s_input)
    h_input = convert_to_hex(s_input)
    print("Operation Info in Hex: " + h_input)
    call_docker(h_input)
    print("Is this the result you were waiting for?")

def format_to_input(op,fo,so):
    data_set = {"op": op, "opdf": fo,"opds": so}
    json_dump = json.dumps(data_set)
    return json_dump

def convert_to_hex(s_input):
    return "0x"+str(s_input.encode("utf-8").hex())

def call_docker(h_input):
    subprocess.call("docker exec calc_hardhat_1 npx hardhat --network localhost calc:addInput --input "+h_input, shell=True)



main()


